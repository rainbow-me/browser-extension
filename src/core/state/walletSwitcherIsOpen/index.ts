import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface WalletSwitcherIsOpenState {
  setWalletSwitcherIsOpen: (isOpen: boolean) => void;
  walletSwitcherIsOpen: boolean;
}

export const walletSwitcherIsOpenStore = createStore<WalletSwitcherIsOpenState>(
  (set) => ({
    setWalletSwitcherIsOpen: (walletSwitcherIsOpen?: boolean) => {
      set({ walletSwitcherIsOpen });
    },
    walletSwitcherIsOpen: false,
  }),
);

export const useWalletSwitcherIsOpenStore = create(walletSwitcherIsOpenStore);
