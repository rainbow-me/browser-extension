import { stateContract } from './state';
import { walletContract } from './wallet';

export const popupRouterContract = {
  wallet: walletContract,
  state: stateContract,
};

export type PopupRouterContract = typeof popupRouterContract;
