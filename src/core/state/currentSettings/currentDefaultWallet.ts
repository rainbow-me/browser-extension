import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CurrentDefaultWalletState {
  currentDefaultWallet: boolean;
  setCurrentDefaultWallet: (DefaultWallet: boolean) => void;
}

export const currentDefaultWalletStore = createStore<CurrentDefaultWalletState>(
  (set) => ({
    currentDefaultWallet: false,
    setCurrentDefaultWallet: (newDefaultWallet) =>
      set({ currentDefaultWallet: newDefaultWallet }),
  }),
  {
    persist: {
      name: 'currentDefaultWallet',
      version: 0,
    },
  },
);

export const useCurrentDefaultWalletStore = create(currentDefaultWalletStore);
