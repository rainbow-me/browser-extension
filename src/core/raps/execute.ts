/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-promise-executor-return */
import { Signer } from '@ethersproject/abstract-signer';
import {
  type BatchCall,
  executeBatchedTransaction,
  supportsDelegation,
} from '@rainbow-me/delegation';
import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { Address, UserRejectedRequestError } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { useGasStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ChainId } from '~/core/types/chains';
import { TransactionGasParams } from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { addNewTransaction, getNextNonce } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import {
  canUseDelegation,
  getViemWalletClient,
} from '~/core/viem/walletClient';
import { RainbowError, logger } from '~/logger';

import { swap, unlock } from './actions';
import {
  crosschainSwap,
  prepareCrosschainSwap,
} from './actions/crosschainSwap';
import { prepareSwap } from './actions/swap';
import { prepareUnlock } from './actions/unlock';
import {
  ActionProps,
  PrepareActionProps,
  PrepareActionResult,
  Rap,
  RapAction,
  RapActionResponse,
  RapActionResult,
  RapActionTypes,
  RapSwapActionParameters,
  RapTypes,
} from './references';
import { createUnlockAndCrosschainSwapRap } from './unlockAndCrosschainSwap';
import { createUnlockAndSwapRap } from './unlockAndSwap';

const ACTION_REJECTED = 'ACTION_REJECTED';

function isAtomicGasParams(
  gasParams: unknown,
): gasParams is TransactionGasParams {
  if (!gasParams || typeof gasParams !== 'object') return false;
  const g = gasParams as Record<string, unknown>;
  return (
    'maxFeePerGas' in g &&
    'maxPriorityFeePerGas' in g &&
    !!g.maxFeePerGas &&
    !!g.maxPriorityFeePerGas
  );
}

function isUserRejectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Error & { code?: string; cause?: unknown };
  if (e instanceof UserRejectedRequestError) return true;
  if (e.name === UserRejectedRequestError.name) return true;
  if (e.code === ACTION_REJECTED || e.code === '4001') return true;
  if (e.cause) return isUserRejectionError(e.cause);
  return false;
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

const actionExecutors = {
  unlock: (p: ActionProps<'unlock'>) => unlock(p),
  swap: (p: ActionProps<'swap'>) => swap(p),
  crosschainSwap: (p: ActionProps<'crosschainSwap'>) => crosschainSwap(p),
} as const satisfies {
  [K in RapActionTypes]: (props: ActionProps<K>) => Promise<RapActionResult>;
};

const prepareExecutors = {
  unlock: (p: PrepareActionProps<'unlock'>) => prepareUnlock(p),
  swap: (p: PrepareActionProps<'swap'>) => prepareSwap(p),
  crosschainSwap: (p: PrepareActionProps<'crosschainSwap'>) =>
    prepareCrosschainSwap(p),
} as const satisfies {
  [K in RapActionTypes]: (
    props: PrepareActionProps<K>,
  ) => Promise<PrepareActionResult>;
};

function hasTransaction(
  r: PrepareActionResult,
): r is { call: BatchCall; transaction: Omit<NewTransaction, 'hash'> } {
  return 'transaction' in r && !!r.transaction;
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
    const actionProps = {
      wallet,
      currentRap: rap,
      index,
      parameters,
      baseNonce,
    };
    const { nonce, hash } =
      type === 'unlock'
        ? await actionExecutors.unlock(actionProps as ActionProps<'unlock'>)
        : type === 'swap'
        ? await actionExecutors.swap(actionProps as ActionProps<'swap'>)
        : await actionExecutors.crosschainSwap(
            actionProps as ActionProps<'crosschainSwap'>,
          );
    return { baseNonce: nonce, errorMessage: null, hash };
  } catch (error) {
    logger.error(new RainbowError(`rap: ${rapName} - error execute action`), {
      message: (error as Error)?.message,
    });
    if (index === 0) {
      return { baseNonce: null, errorMessage: String(error) };
    }
    return { baseNonce: null, errorMessage: null };
  }
}

function getRapFullName<T extends RapActionTypes>(actions: RapAction<T>[]) {
  const actionTypes = actions.map((action) => action.type);
  return actionTypes.join(' + ');
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const NODE_ACK_MAX_TRIES = 10;

const waitForNodeAck = async (
  hash: string,
  provider: Signer['provider'],
  tries = 0,
): Promise<void> => {
  try {
    const tx = await provider?.getTransaction(hash);
    // This means the node is aware of the tx, we're good to go
    if (
      (tx && tx.blockNumber === null) ||
      (tx && tx?.blockNumber && tx?.blockNumber > 0)
    ) {
      return;
    } else {
      // Wait for 1 second and try again
      if (tries < NODE_ACK_MAX_TRIES) {
        await delay(1000);
        return waitForNodeAck(hash, provider, tries + 1);
      }
    }
  } catch (error) {
    if (tries < NODE_ACK_MAX_TRIES) {
      await delay(1000);
      return waitForNodeAck(hash, provider, tries + 1);
    }
  }
};

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

  // Check if atomic execution should be used
  // Atomic execution requires: delegation feature flag + chain support + atomic parameter + swap type
  // Local flags override remote flags when set (not null), otherwise use remote flag
  const remoteEnabled = config.atomic_swaps_enabled ?? false;
  const localEnabled =
    useFeatureFlagsStore.getState().featureFlags.atomic_swaps_enabled;
  // Local flag takes precedence if set (not null), otherwise use remote flag
  const atomicSwapsEnabled =
    localEnabled !== null ? localEnabled : remoteEnabled;

  // Only check delegation support when atomic swaps are enabled to avoid
  // unnecessary network calls that could fail in environments without
  // the delegation API (e.g. E2E tests)
  let delegationEnabled = false;
  if (atomicSwapsEnabled) {
    try {
      const walletAddress = (await wallet.getAddress()) as Address;
      const delegationSupported = await supportsDelegation({
        address: walletAddress,
        chainId: parameters.chainId,
      });
      delegationEnabled = delegationSupported.supported;
    } catch (error) {
      logger.warn('[walletExecuteRap] supportsDelegation check failed', {
        message: (error as Error)?.message,
      });
    }
  }

  console.log('[Delegation] Background: delegation SDK enabled for swap', {
    delegationEnabled,
    atomicSwapsEnabled,
    chainId: parameters.chainId,
  });

  if (
    delegationEnabled &&
    parameters.atomic &&
    (type === 'swap' || type === 'crosschainSwap')
  ) {
    const swapParams = parameters as RapSwapActionParameters<
      'swap' | 'crosschainSwap'
    >;
    const { chainId, quote } = swapParams;
    const { selectedGas } = useGasStore.getState();
    const gasParams = selectedGas.transactionGasParams;

    if (!quote) {
      return {
        nonce: undefined,
        errorMessage: 'Quote is required for atomic execution',
        hash: null,
      };
    }

    const userAddress = (await wallet.getAddress()) as Address;
    const canUse = await canUseDelegation(userAddress);
    const gasParamsEip1559 = isAtomicGasParams(gasParams) ? gasParams : null;

    if (canUse && gasParamsEip1559) {
      try {
        const calls: BatchCall[] = [];
        let pendingTransaction: Omit<NewTransaction, 'hash'> | null = null;

        for (const action of actions) {
          const props = {
            parameters: action.parameters,
            wallet,
            chainId,
            quote: quote as Quote | CrosschainQuote,
          };
          const prepareResult =
            action.type === 'unlock'
              ? await prepareExecutors.unlock(
                  props as PrepareActionProps<'unlock'>,
                )
              : action.type === 'swap'
              ? await prepareExecutors.swap(props as PrepareActionProps<'swap'>)
              : await prepareExecutors.crosschainSwap(
                  props as PrepareActionProps<'crosschainSwap'>,
                );

          if (prepareResult.call) calls.push(prepareResult.call);
          if (hasTransaction(prepareResult)) {
            pendingTransaction = prepareResult.transaction;
          }
        }

        if (!calls.length) {
          return {
            nonce: undefined,
            errorMessage: 'No calls to execute',
            hash: null,
          };
        }

        const walletClient = await getViemWalletClient({
          address: userAddress,
          chainId,
        });

        if (walletClient) {
          try {
            const publicClient = getViemClient({ chainId });
            const baseNonce = await getNextNonce({
              address: userAddress,
              chainId: chainId as ChainId,
            });

            const result = await executeBatchedTransaction({
              calls,
              walletClient,
              publicClient,
              chainId,
              nonce: baseNonce,
              transactionOptions: {
                maxFeePerGas: BigInt(gasParamsEip1559.maxFeePerGas ?? 0),
                maxPriorityFeePerGas: BigInt(
                  gasParamsEip1559.maxPriorityFeePerGas ?? 0,
                ),
                gasLimit: null,
              },
            });

            if (result?.hash) {
              if (pendingTransaction) {
                const pendingTxNonce =
                  result.type === 'eip7702' ? baseNonce + 1 : baseNonce;
                addNewTransaction({
                  address: quote.from as Address,
                  chainId,
                  transaction: {
                    ...pendingTransaction,
                    hash: result.hash as TxHash,
                    nonce: pendingTxNonce,
                  },
                });
              }
              return {
                nonce: baseNonce,
                errorMessage: null,
                hash: result.hash,
              };
            }
          } catch (error) {
            if (isUserRejectionError(error)) {
              return {
                nonce: undefined,
                errorMessage: (error as Error).message,
                hash: null,
              };
            }
            logger.warn(
              `[${rapName}] atomic execution failed - falling back to normal flow`,
              { message: (error as Error)?.message },
            );
          }
        }
      } catch (error) {
        if (isUserRejectionError(error)) {
          return {
            nonce: undefined,
            errorMessage: (error as Error).message,
            hash: null,
          };
        }
        logger.warn(
          `[${rapName}] atomic execution preparation failed - falling back to normal flow`,
          { message: (error as Error)?.message },
        );
      }
    }
  }

  // Sequential execution path (existing behavior)
  let nonce = parameters?.nonce;
  let errorMessage = null;
  let txHash = null;

  if (actions.length) {
    const firstAction = actions[0];
    const actionParams = {
      action: firstAction,
      wallet,
      rap,
      index: 0,
      baseNonce: nonce,
      rapName,
    };
    const {
      baseNonce,
      errorMessage: error,
      hash: firstHash,
    } = await executeAction(actionParams);
    const shouldWaitForNodeAck = parameters.chainId !== ChainId.mainnet;

    if (typeof baseNonce === 'number') {
      let latestHash = firstHash;
      for (let index = 1; index < actions.length; index++) {
        latestHash &&
          shouldWaitForNodeAck &&
          (await waitForNodeAck(latestHash, wallet.provider));
        const action = actions[index];
        const actionParams = {
          action,
          wallet,
          rap,
          index,
          baseNonce,
          rapName,
        };
        const { hash } = await executeAction(actionParams);
        latestHash = hash;
        if (index === actions.length - 1) {
          txHash = hash;
        }
      }
      nonce = baseNonce + actions.length - 1;
    } else {
      errorMessage = error;
    }
  }
  return { nonce, errorMessage, hash: txHash };
};
