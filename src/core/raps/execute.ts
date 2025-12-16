/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-promise-executor-return */
import { Signer } from '@ethersproject/abstract-signer';
import {
  BatchCall,
  executeBatchedTransaction,
  supportsDelegation,
} from '@rainbow-me/rainbow-delegation';
import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { Address } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { useGasStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ChainId } from '~/core/types/chains';
import { TransactionGasParams } from '~/core/types/gas';
import { NewTransaction, TxHash } from '~/core/types/transactions';
import { addNewTransaction, getNextNonce } from '~/core/utils/transactions';
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

/**
 * Get the prepare function for an action type (for atomic execution).
 */
function typePrepareAction<T extends RapActionTypes>(
  type: T,
  props: PrepareActionProps<T>,
): () => Promise<PrepareActionResult> {
  switch (type) {
    case 'unlock':
      return () => prepareUnlock(props as PrepareActionProps<'unlock'>);
    case 'swap':
      return () => prepareSwap(props as PrepareActionProps<'swap'>);
    case 'crosschainSwap':
      return () =>
        prepareCrosschainSwap(props as PrepareActionProps<'crosschainSwap'>);
    default:
      throw new Error(
        `Action type "${type}" does not support atomic execution`,
      );
  }
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
  // Check if delegation is supported (handles both chain support and user preferences)
  const walletAddress = (await wallet.getAddress()) as Address;
  const delegationSupported = await supportsDelegation({
    address: walletAddress,
    chainId: parameters.chainId,
  });
  const delegationEnabled = atomicSwapsEnabled && delegationSupported.supported;

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
    const gasParams = selectedGas.transactionGasParams as TransactionGasParams;

    if (!quote) {
      return {
        nonce: undefined,
        errorMessage: 'Quote is required for atomic execution',
        hash: null,
      };
    }

    try {
      const calls: BatchCall[] = [];
      let pendingTransaction: Omit<NewTransaction, 'hash'> | null = null;

      // Prepare all actions
      for (const action of actions) {
        const prepareResult = await typePrepareAction(action.type, {
          parameters: action.parameters,
          wallet,
          chainId,
          quote: quote as Quote | CrosschainQuote,
        } as PrepareActionProps<typeof action.type>)();

        if (prepareResult.call) {
          calls.push(prepareResult.call);
        }
        if ('transaction' in prepareResult && prepareResult.transaction) {
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

      // Get wallet client for atomic execution
      const userAddress = (await wallet.getAddress()) as Address;

      // supportsDelegation() already checked above, so we can proceed
      const walletClient = await getViemWalletClient({
        address: userAddress,
        chainId,
      });

      if (walletClient) {
        try {
          // Get public client
          const publicClient = getViemClient({ chainId });

          // Get nonce for the transaction
          // Note: SDK increments +2 between authorization and execute, so we account for that
          const baseNonce = await getNextNonce({
            address: userAddress,
            chainId: chainId as ChainId,
          });

          // Execute batched transaction
          const result = await executeBatchedTransaction({
            calls,
            walletClient,
            publicClient,
            chainId,
            nonce: baseNonce,
            transactionOptions: {
              maxFeePerGas: BigInt(gasParams.maxFeePerGas ?? 0),
              maxPriorityFeePerGas: BigInt(gasParams.maxPriorityFeePerGas ?? 0),
              gasLimit: null,
            },
          });

          if (result?.hash) {
            // pendingTransaction should always exist since unlock is always followed by swap/crosschainSwap
            if (!pendingTransaction) {
              logger.error(
                new RainbowError(
                  `[${rapName}] No pending transaction prepared for atomic execution`,
                ),
              );
            } else {
              // v4 consumes 2 nonces, so use baseNonce+1 for pending tx
              // v2 uses just baseNonce
              const pendingTxNonce =
                result.type === 'v4' ? baseNonce + 1 : baseNonce;

              // Add pending transaction with hash and nonce
              const transaction: NewTransaction = {
                ...pendingTransaction,
                hash: result.hash as TxHash,
                nonce: pendingTxNonce,
              };

              addNewTransaction({
                address: quote.from as Address,
                chainId,
                transaction,
              });
            }

            logger.debug(`[${rapName}] executed atomically (${result.type})`, {
              hash: result.hash,
            });
            return {
              nonce: baseNonce,
              errorMessage: null,
              hash: result.hash,
            };
          }
        } catch (error) {
          logger.warn(
            `[${rapName}] atomic execution failed - falling back to normal flow`,
            {
              message: (error as Error)?.message,
            },
          );
          // Fall through to sequential execution path below
        }
      }
      // Fall through to sequential execution path below
    } catch (error) {
      logger.warn(
        `[${rapName}] atomic execution preparation failed - falling back to normal flow`,
        {
          message: (error as Error)?.message,
        },
      );
      // Fall through to sequential execution path below
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
