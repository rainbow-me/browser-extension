import { Signer } from '@ethersproject/abstract-signer';

import { logger } from '~/logger';

import { swap, unlock } from './actions';
import { crosschainSwap } from './actions/crosschainSwap';
import {
  ActionProps,
  Rap,
  RapAction,
  RapActionParameterMap,
  RapActionResponse,
  RapActionTypes,
  RapSwapActionParameters,
  RapTypes,
} from './references';
import { createUnlockAndCrosschainSwapRap } from './unlockAndCrosschainSwap';
import { createUnlockAndSwapRap } from './unlockAndSwap';

function getRapFullName<T extends RapActionTypes>(actions: RapAction<T>[]) {
  const actionTypes = actions.map((action) => action.type);
  return actionTypes.join(' + ');
}

export function createNewAction<T extends RapActionTypes>(
  type: T,
  parameters: RapActionParameterMap[T],
): RapAction<T> {
  const newAction = {
    parameters,
    transaction: { confirmed: null, hash: null },
    type,
  };
  return newAction;
}

export function createNewRap<T extends RapActionTypes>(
  actions: RapAction<T>[],
) {
  return {
    actions,
  };
}

function createSwapRapByType<T extends RapTypes>(
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

async function executeAction<T extends RapActionTypes>({
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
  let nonce;
  try {
    const actionProps = {
      wallet,
      currentRap: rap,
      index,
      parameters,
      baseNonce,
    };
    nonce = await typeAction<T>(type, actionProps)();
    return { baseNonce: nonce, errorMessage: null };
  } catch (error) {
    logger.error({
      name: `rap: ${rapName} - error execute action`,
      message: (error as Error)?.message,
    });
    if (index === 0) {
      return { baseNonce: null, errorMessage: String(error) };
    }
    return { baseNonce: null, errorMessage: null };
  }
}

export const walletExecuteRap = async (
  wallet: Signer,
  type: RapTypes,
  parameters: RapSwapActionParameters<'swap' | 'crosschainSwap'>,
): Promise<{ nonce: number | undefined; errorMessage: string | null }> => {
  const rap: Rap = await createSwapRapByType(type, parameters);

  const { actions } = rap;
  const rapName = getRapFullName(rap.actions);
  let nonce = parameters?.nonce;
  let errorMessage = null;
  if (actions.length) {
    const firstAction = actions[0];
    const { baseNonce, errorMessage: error } = await executeAction({
      action: firstAction,
      wallet,
      rap,
      index: 0,
      baseNonce: nonce,
      rapName,
    });

    if (typeof baseNonce === 'number') {
      for (let index = 1; index < actions.length; index++) {
        const action = actions[index];
        // eslint-disable-next-line no-await-in-loop
        await executeAction({
          action,
          wallet,
          rap,
          index,
          baseNonce,
          rapName,
        });
      }
      nonce = baseNonce + actions.length - 1;
    } else {
      errorMessage = error;
    }
  }
  return { nonce, errorMessage };
};
