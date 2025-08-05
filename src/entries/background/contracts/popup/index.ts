import { walletContract } from './wallet';

export const popupRouterContract = {
  wallet: walletContract,
};

export type PopupRouterContract = typeof popupRouterContract;
