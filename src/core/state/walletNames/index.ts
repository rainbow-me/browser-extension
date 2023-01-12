import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface WalletNamesStore {
  walletNames: { [address: Address]: string };
  getWalletName: ({
    address,
  }: {
    address: Address | undefined;
  }) => string | undefined;
  saveWalletName: ({
    name,
    address,
  }: {
    name: string;
    address: Address;
  }) => void;
  deleteWalletName: ({ address }: { address: Address }) => void;
}

export const walletNamesStore = createStore<WalletNamesStore>(
  (set, get) => ({
    walletNames: {},
    getWalletName: ({ address }) => {
      const walletNames = get().walletNames;
      return address ? walletNames[address] : undefined;
    },
    saveWalletName: ({ name, address }) => {
      const walletNames = get().walletNames;
      const newWalletNames = {
        ...walletNames,
        [address]: name,
      };
      set({ walletNames: newWalletNames });
    },
    deleteWalletName: ({ address }) => {
      const walletNames = get().walletNames;
      delete walletNames[address];
      set({ walletNames: { ...walletNames } });
    },
  }),
  {
    persist: {
      name: 'walletNames',
      version: 0,
    },
  },
);

export const useWalletNamesStore = create(walletNamesStore);
