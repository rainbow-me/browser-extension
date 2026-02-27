/* eslint-disable no-await-in-loop */
import { type Signer } from '@ethersproject/abstract-signer';
import {
  type BatchCall,
  type UnsupportedReason,
  executeBatchedTransaction,
  supportsDelegation,
} from '@rainbow-me/delegation';
import { type SignedAuthorizationList, UserRejectedRequestError } from 'viem';

import {
  getAtomicSwapsEnabled,
  getDelegationEnabled,
} from '~/core/resources/delegations/featureStatus';
import { ChainId } from '~/core/types/chains';
import { type TransactionGasParams } from '~/core/types/gas';
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
  type PrepareActionProps,
  type PrepareActionResult,
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

const ACTION_REJECTED = 'ACTION_REJECTED';
const NODE_ACK_MAX_TRIES = 10;

type AtomicPrepareActionType = Extract<
  RapActionTypes,
  'unlock' | 'swap' | 'crosschainSwap'
>;
type AtomicPrepareResult = PrepareActionResult;
type RapFactoryResult = { actions: RapAction<RapActionTypes>[] };

type Executors = {
  action: {
    [K in RapActionTypes]: (props: ActionProps<K>) => Promise<RapActionResult>;
  };
  prepare: {
    [K in AtomicPrepareActionType]: (
      props: PrepareActionProps<K>,
    ) => Promise<AtomicPrepareResult>;
  };
  rapFactory: {
    [K in RapTypes]: (
      params: RapSwapActionParameters<K>,
    ) => Promise<RapFactoryResult>;
  };
};

const executors: Executors = {
  action: {
    crosschainSwap,
    swap,
    unlock,
  },
  prepare: {
    crosschainSwap: prepareCrosschainSwap,
    swap: prepareSwap,
    unlock: prepareUnlock,
  },
  rapFactory: {
    crosschainSwap: createUnlockAndCrosschainSwapRap,
    swap: createUnlockAndSwapRap,
  },
};

export function createSwapRapByType<T extends RapTypes>(
  type: T,
  swapParameters: RapSwapActionParameters<T>,
): Promise<RapFactoryResult> {
  return executors.rapFactory[type](swapParameters);
}

function runAction<T extends RapActionTypes>(
  type: T,
  props: ActionProps<T>,
): Promise<RapActionResult> {
  return executors.action[type](props);
}

function runAtomicPrepareAction<T extends AtomicPrepareActionType>(
  type: T,
  props: PrepareActionProps<T>,
): Promise<AtomicPrepareResult> {
  return executors.prepare[type](props);
}

export async function executeAction<T extends RapActionTypes>({
  action,
  wallet,
  rap,
  index,
  baseNonce,
  rapName,
}: {
  action: RapAction<T>;
  wallet: Signer;
  rap: Rap;
  index: number;
  baseNonce?: number;
  rapName: string;
}): Promise<RapActionResponse> {
  const { type, parameters } = action;

  try {
    const { nonce, hash } = await runAction(type, {
      wallet,
      currentRap: rap,
      index,
      parameters,
      baseNonce,
    });

    return { baseNonce: nonce, errorMessage: null, hash };
  } catch (error) {
    const parsedError = toError(error);
    logger.error(new RainbowError(`rap: ${rapName} - error execute action`), {
      message: parsedError.message,
    });

    return { baseNonce: null, errorMessage: parsedError.toString() };
  }
}

function getRapFullName<T extends RapActionTypes>(actions: RapAction<T>[]) {
  return actions.map((action) => action.type).join(' + ');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForNodeAck(
  hash: string,
  provider: Signer['provider'],
  tries = 0,
): Promise<void> {
  try {
    const tx = await provider?.getTransaction(hash);

    // Node has accepted tx into mempool (or mined it)
    if (
      (tx && tx.blockNumber === null) ||
      (tx && tx.blockNumber && tx.blockNumber > 0)
    ) {
      return;
    }

    if (tries < NODE_ACK_MAX_TRIES) {
      await delay(1000);
      return waitForNodeAck(hash, provider, tries + 1);
    }
  } catch {
    if (tries < NODE_ACK_MAX_TRIES) {
      await delay(1000);
      return waitForNodeAck(hash, provider, tries + 1);
    }
  }
}

export const walletExecuteRap = async (
  wallet: Signer,
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
    const { chainId, gasParams, nonce, quote } = parameters;

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

            if (
              result.type === 'eip7702' &&
              isSignedAuthorizationList(result.transaction.authorizationList)
            ) {
              transaction.authorizationList =
                result.transaction.authorizationList;
            }

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
    const firstAction = actions[0];
    const {
      baseNonce,
      errorMessage: firstActionError,
      hash: firstHash,
    } = await executeAction({
      action: firstAction,
      wallet,
      rap,
      index: 0,
      baseNonce: nonce,
      rapName,
    });

    txHash = firstHash ?? null;

    const shouldWaitForNodeAck = parameters.chainId !== ChainId.mainnet;

    if (typeof baseNonce === 'number') {
      let latestHash = firstHash ?? null;

      for (let index = 1; index < actions.length; index++) {
        if (latestHash && shouldWaitForNodeAck) {
          await waitForNodeAck(latestHash, wallet.provider);
        }

        const action = actions[index];
        const { hash, errorMessage: actionError } = await executeAction({
          action,
          wallet,
          rap,
          index,
          baseNonce,
          rapName,
        });

        if (!errorMessage && actionError) {
          errorMessage = actionError;
        }

        if (hash) {
          latestHash = hash;
          txHash = hash;
        }
      }

      nonce = baseNonce + actions.length - 1;
    } else {
      errorMessage = firstActionError;
      txHash = null;
    }
  }

  return { nonce, errorMessage, hash: txHash };
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
    typeof maxFeePerGas === 'string' &&
    maxFeePerGas.length > 0 &&
    typeof maxPriorityFeePerGas === 'string' &&
    maxPriorityFeePerGas.length > 0
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

function isSignedAuthorizationList(
  value: unknown,
): value is SignedAuthorizationList {
  if (!Array.isArray(value)) return false;

  return value.every((authorization) => {
    if (!isObject(authorization)) return false;

    const address = Reflect.get(authorization, 'address');
    const chainId = Reflect.get(authorization, 'chainId');
    const nonce = Reflect.get(authorization, 'nonce');
    const r = Reflect.get(authorization, 'r');
    const s = Reflect.get(authorization, 's');
    const v = Reflect.get(authorization, 'v');
    const yParity = Reflect.get(authorization, 'yParity');

    if (!isHexString(address)) return false;
    if (typeof chainId !== 'number') return false;
    if (typeof nonce !== 'number') return false;
    if (!isHexString(r) || !isHexString(s)) return false;

    return typeof v === 'bigint' || typeof yParity === 'number';
  });
}

function isHexString(value: unknown): value is `0x${string}` {
  return typeof value === 'string' && value.startsWith('0x');
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}
