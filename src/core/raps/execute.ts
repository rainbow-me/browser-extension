/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-promise-executor-return */
import { Signer } from '@ethersproject/abstract-signer';

import { ChainId } from '~/core/types/chains';
import { RainbowError, logger } from '~/logger';

import { claim, swap, unlock } from './actions';
import { claimBridge } from './actions/claimBridge';
import { crosschainSwap } from './actions/crosschainSwap';
import { createClaimAndBridgeRap } from './claimAndBridge';
import {
  ActionProps,
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
    case 'claimBridge':
      return createClaimAndBridgeRap(
        swapParameters as RapSwapActionParameters<'claimBridge'>,
      );
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
    case 'claim':
      return () => claim(props as ActionProps<'claim'>);
    case 'unlock':
      return () => unlock(props as ActionProps<'unlock'>);
    case 'swap':
      return () => swap(props as ActionProps<'swap'>);
    case 'crosschainSwap':
      return () => crosschainSwap(props as ActionProps<'crosschainSwap'>);
    case 'claimBridge':
      return () => claimBridge(props as ActionProps<'claimBridge'>);
    default:
      // eslint-disable-next-line react/display-name
      return () => null;
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
  parameters: RapSwapActionParameters<
    'swap' | 'crosschainSwap' | 'claimBridge'
  >,
): Promise<{
  nonce: number | undefined;
  errorMessage: string | null;
  hash?: string | null;
}> => {
  const rap: Rap = await createSwapRapByType(type, parameters);

  const { actions } = rap;
  const rapName = getRapFullName(rap.actions);
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
