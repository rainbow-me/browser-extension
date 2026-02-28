/* eslint-disable no-await-in-loop */
import {
  type BatchCall,
  type UnsupportedReason,
  executeBatchedTransaction,
  supportsDelegation,
} from '@rainbow-me/delegation';
import type { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { PublicClient, UserRejectedRequestError, WalletClient } from 'viem';

import {
  getAtomicSwapsEnabled,
  getDelegationEnabled,
} from '~/core/resources/delegations/featureStatus';
import { useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  type TransactionGasParams,
  type TransactionLegacyGasParams,
} from '~/core/types/gas';
import { type NewTransaction } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { getViemWalletClient } from '~/core/viem/walletClient';
import { RainbowError, logger } from '~/logger';

import { swap, unlock } from './actions';
import {
  crosschainSwap,
  prepareCrosschainSwap,
} from './actions/crosschainSwap';
import { prepareSwap } from './actions/swap';
import { prepareUnlock } from './actions/unlock';
import {
  type ActionProps,
  type Rap,
  type RapAction,
  type RapActionResponse,
  type RapActionResult,
  type RapActionTypes,
  type RapSwapActionParameters,
  type RapTypes,
} from './references';
import { extractReplayableCall } from './replay';
import { createUnlockAndCrosschainSwapRap } from './unlockAndCrosschainSwap';
import { createUnlockAndSwapRap } from './unlockAndSwap';
import { deserializeGasParams } from './utils';

type AtomicPrepareActionType = Extract<
  RapActionTypes,
  'unlock' | 'swap' | 'crosschainSwap'
>;

type PrepareActionProps<T extends AtomicPrepareActionType> = {
  parameters: ActionProps<T>['parameters'];
  wallet: WalletClient;
  chainId: ChainId;
  quote: Quote | CrosschainQuote;
};

type PrepareActionResult =
  | { call: BatchCall | null }
  | { call: BatchCall; transaction: Omit<NewTransaction, 'hash'> };

const ACTION_REJECTED = 'ACTION_REJECTED';

function runAtomicPrepareAction<T extends AtomicPrepareActionType>(
  type: T,
  props: PrepareActionProps<T> & {
    gasParams?: TransactionGasParams | TransactionLegacyGasParams;
  },
): Promise<PrepareActionResult> {
  switch (type) {
    case 'unlock':
      return prepareUnlock(props as PrepareActionProps<'unlock'>);
    case 'swap':
      return prepareSwap({
        ...props,
        gasParams: props.gasParams,
      } as PrepareActionProps<'swap'> & {
        gasParams?: TransactionGasParams | TransactionLegacyGasParams;
      });
    case 'crosschainSwap': {
      const crosschainProps = {
        ...props,
        quote: props.quote as CrosschainQuote,
        gasParams: props.gasParams,
      };
      return prepareCrosschainSwap(
        crosschainProps as Parameters<typeof prepareCrosschainSwap>[0],
      );
    }
    default:
      throw new Error(`Unsupported atomic action type: ${type}`);
  }
}

export function createSwapRapByType<T extends RapTypes>(
  type: T,
  swapParameters: RapSwapActionParameters<T>,
) {
  switch (type) {
    case 'crosschainSwap':
      return createUnlockAndCrosschainSwapRap(
        swapParameters as RapSwapActionParameters<'crosschainSwap'>,
      );
    case 'swap':
      return createUnlockAndSwapRap(
        swapParameters as RapSwapActionParameters<'swap'>,
      );
    default:
      return { actions: [] };
  }
}

function typeAction<T extends RapActionTypes>(type: T, props: ActionProps<T>) {
  switch (type) {
    case 'unlock':
      return () => unlock(props as ActionProps<'unlock'>);
    case 'swap':
      return () => swap(props as ActionProps<'swap'>);
    case 'crosschainSwap':
      return () => crosschainSwap(props as ActionProps<'crosschainSwap'>);
    default:
      // eslint-disable-next-line react/display-name
      return () => null;
  }
}

export async function executeAction<T extends RapActionTypes>({
  action,
  client,
  wallet,
  rap,
  index,
  baseNonce,
  rapName,
}: {
  action: RapAction<T>;
  client: PublicClient;
  wallet: WalletClient;
  rap: Rap;
  index: number;
  baseNonce?: number;
  rapName: string;
}): Promise<RapActionResponse> {
  const { type, parameters } = action;
  try {
    const actionProps = {
      client,
      wallet,
      currentRap: rap,
      index,
      parameters,
      baseNonce,
    };
    const { nonce, hash } = (await typeAction<T>(
      type,
      actionProps,
    )()) as RapActionResult;
    return { baseNonce: nonce, errorMessage: null, hash };
  } catch (error) {
    logger.error(new RainbowError(`rap: ${rapName} - error execute action`), {
      message: (error as Error)?.message,
    });
    if (index === 0) {
      return {
        baseNonce: null,
        errorMessage: error != null ? String(error) : null,
      };
    }
    return { baseNonce: null, errorMessage: null };
  }
}

function getRapFullName<T extends RapActionTypes>(actions: RapAction<T>[]) {
  const actionTypes = actions.map((action) => action.type);
  return actionTypes.join(' + ');
}

const delay = (ms: number) =>
  new Promise<void>((res) => {
    setTimeout(res, ms);
  });

const NODE_ACK_MAX_TRIES = 10;

const waitForNodeAck = async (
  hash: string,
  client: PublicClient,
  tries = 0,
): Promise<void> => {
  try {
    const tx = await client.getTransaction({
      hash: hash as `0x${string}`,
    });
    if (
      (tx && tx.blockNumber === null) ||
      (tx && tx?.blockNumber && tx.blockNumber > 0n)
    ) {
      return;
    } else {
      if (tries < NODE_ACK_MAX_TRIES) {
        await delay(1000);
        return waitForNodeAck(hash, client, tries + 1);
      }
    }
  } catch (error) {
    if (tries < NODE_ACK_MAX_TRIES) {
      await delay(1000);
      return waitForNodeAck(hash, client, tries + 1);
    }
  }
};

export const walletExecuteRap = async (
  wallet: WalletClient,
  type: RapTypes,
  parameters: RapSwapActionParameters<'swap' | 'crosschainSwap'>,
): Promise<{
  nonce: number | undefined;
  errorMessage: string | null;
  hash?: string | null;
}> => {
  const rap: Rap = await createSwapRapByType(type, parameters);

  const { actions } = rap;
  const rapName = getRapFullName(rap.actions);

  const atomicEnabled = getAtomicSwapsEnabled();
  const delegationEnabled = getDelegationEnabled();
  const canAttemptAtomic =
    atomicEnabled &&
    delegationEnabled &&
    Boolean(parameters.atomic) &&
    isAtomicRapType(type);

  let delegationSupported = false;
  let delegationUnsupportedReason: UnsupportedReason | 'NO_ADDRESS' | null =
    null;

  if (canAttemptAtomic) {
    const address = parameters.quote?.from;
    if (!address) {
      delegationUnsupportedReason = 'NO_ADDRESS';
    } else {
      try {
        const support = await supportsDelegation({
          address,
          chainId: parameters.chainId,
        });
        delegationSupported = support.supported;
        delegationUnsupportedReason = support.reason;
      } catch (error) {
        logger.warn(`[${rapName}] supportsDelegation check failed`, {
          message: toError(error).message,
        });
      }
    }

    if (!delegationSupported) {
      logger.debug(`[${rapName}] atomic execution unavailable`, {
        reason: delegationUnsupportedReason,
        chainId: parameters.chainId,
        address: parameters.quote?.from,
      });
    }
  }

  if (canAttemptAtomic && delegationSupported) {
    const { chainId, nonce, quote } = parameters;
    let gasParams =
      parameters.gasParams ??
      deserializeGasParams(parameters.serializedGasParams);
    if (!gasParams) {
      const { selectedGas } = useGasStore.getState();
      gasParams = selectedGas?.transactionGasParams;
    }

    if (!quote) {
      return {
        nonce: undefined,
        hash: null,
        errorMessage: 'Quote is required for atomic execution',
      };
    }

    if (nonce === undefined || !isAtomicGasParams(gasParams)) {
      logger.debug(`[${rapName}] atomic execution skipped, falling back`, {
        reason:
          nonce === undefined ? 'missing nonce' : 'non-eip1559-gas-params',
      });
    } else {
      try {
        const calls: BatchCall[] = [];
        let pendingTransaction: Omit<NewTransaction, 'hash'> | null = null;

        for (const action of actions) {
          if (!isAtomicPrepareAction(action)) {
            throw new Error('Action does not support atomic execution');
          }

          const prepareResult = await runAtomicPrepareAction(action.type, {
            parameters: action.parameters,
            wallet,
            chainId,
            quote,
            gasParams,
          });

          if (prepareResult.call) {
            calls.push(prepareResult.call);
          }

          if ('transaction' in prepareResult) {
            pendingTransaction = prepareResult.transaction;
          }
        }

        if (!calls.length) {
          return {
            nonce: undefined,
            hash: null,
            errorMessage: 'No calls to execute',
          };
        }

        const walletClient = await getViemWalletClient({
          address: quote.from,
          chainId,
        });

        if (!walletClient) {
          logger.debug(`[${rapName}] atomic execution skipped, falling back`, {
            reason: 'unsupported-wallet-client',
          });
        } else {
          const publicClient = getViemClient({ chainId });
          const result = await executeBatchedTransaction({
            calls,
            walletClient,
            publicClient,
            chainId,
            value: BigInt(quote.value?.toString() ?? '0'),
            transactionOptions: {
              maxFeePerGas: BigInt(gasParams.maxFeePerGas),
              maxPriorityFeePerGas: BigInt(gasParams.maxPriorityFeePerGas),
              gasLimit: null,
            },
            nonce,
          });

          if (!result.hash) {
            return {
              nonce: undefined,
              hash: null,
              errorMessage: 'Transaction failed - no hash returned',
            };
          }

          if (pendingTransaction) {
            const transaction: NewTransaction = {
              ...pendingTransaction,
              ...extractReplayableCall(result.transaction, pendingTransaction),
              hash: result.hash,
              nonce,
              batch: true,
              delegation: result.type === 'eip7702',
              gasLimit:
                pendingTransaction.gasLimit ??
                result.transaction.gas?.toString(),
            };

            addNewTransaction({
              address: quote.from,
              chainId,
              transaction,
            });
          }

          logger.debug(`[${rapName}] executed atomically`, {
            hash: result.hash,
          });

          return {
            nonce,
            hash: result.hash,
            errorMessage: null,
          };
        }
      } catch (error) {
        const isUserRejection = isUserRejectionError(error);

        if (isUserRejection) {
          return {
            nonce: undefined,
            hash: null,
            errorMessage: toError(error).message,
          };
        }

        logger.warn(
          `[${rapName}] atomic execution failed - falling back to normal flow`,
          {
            message: toError(error).message,
          },
        );
      }
    }
  }

  // -- Sequential execution path
  let nonce = parameters.nonce;
  let errorMessage: string | null = null;
  let txHash: string | null = null;

  if (actions.length) {
    const client = getViemClient({ chainId: parameters.chainId });
    const firstAction = actions[0];
    const {
      baseNonce,
      errorMessage: error,
      hash: firstHash,
    } = await executeAction({
      action: firstAction,
      client,
      wallet,
      rap,
      index: 0,
      baseNonce: nonce,
      rapName,
    });
    const shouldWaitForNodeAck = parameters.chainId !== ChainId.mainnet;

    if (typeof baseNonce === 'number') {
      let latestHash = firstHash;
      for (let index = 1; index < actions.length; index++) {
        latestHash &&
          shouldWaitForNodeAck &&
          (await waitForNodeAck(latestHash, client));
        const action = actions[index];
        const { hash } = await executeAction({
          action,
          client,
          wallet,
          rap,
          index,
          baseNonce,
          rapName,
        });
        latestHash = hash;
        if (index === actions.length - 1) {
          txHash = hash ?? null;
        }
      }
      nonce = baseNonce + actions.length - 1;
    } else {
      errorMessage = error ?? null;
    }
  }
  return {
    nonce,
    errorMessage: errorMessage ?? null,
    hash: txHash ?? null,
  };
};

function isAtomicRapType(type: RapTypes): type is 'swap' | 'crosschainSwap' {
  return type === 'swap' || type === 'crosschainSwap';
}

function isAtomicPrepareAction(
  action: RapAction<RapActionTypes>,
): action is RapAction<AtomicPrepareActionType> {
  return (
    action.type === 'unlock' ||
    action.type === 'swap' ||
    action.type === 'crosschainSwap'
  );
}

function isAtomicGasParams(
  gasParams: unknown,
): gasParams is TransactionGasParams {
  if (!isObject(gasParams)) return false;

  const maxFeePerGas = Reflect.get(gasParams, 'maxFeePerGas');
  const maxPriorityFeePerGas = Reflect.get(gasParams, 'maxPriorityFeePerGas');
  return (
    ((typeof maxFeePerGas === 'bigint' && maxFeePerGas > 0n) ||
      (typeof maxFeePerGas === 'string' && maxFeePerGas.length > 0)) &&
    ((typeof maxPriorityFeePerGas === 'bigint' && maxPriorityFeePerGas > 0n) ||
      (typeof maxPriorityFeePerGas === 'string' &&
        maxPriorityFeePerGas.length > 0))
  );
}

function isUserRejectionError(error: unknown): boolean {
  if (!isObject(error)) return false;

  if (error instanceof UserRejectedRequestError) return true;

  const name = Reflect.get(error, 'name');
  const code = Reflect.get(error, 'code');
  const cause = Reflect.get(error, 'cause');

  if (name === UserRejectedRequestError.name) return true;
  if (code === ACTION_REJECTED || code === '4001') return true;

  return isUserRejectionError(cause);
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}
