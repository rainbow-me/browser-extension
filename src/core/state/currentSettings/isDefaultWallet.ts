import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface IsDefaultWalletState {
  isDefaultWallet: boolean;
  setIsDefaultWallet: (isDefaultWallet: boolean) => void;
}

export const isDefaultWalletStore = createStore<IsDefaultWalletState>(
  (set) => ({
    isDefaultWallet: true,
    setIsDefaultWallet: (newIsDefaultWallet) =>
      set({ isDefaultWallet: newIsDefaultWallet }),
  }),
  {
    persist: {
      name: 'isDefaultWallet',
      version: 0,
    },
  },
);

export const useIsDefaultWalletStore = create(isDefaultWalletStore);
