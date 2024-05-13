import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

export interface WalletOrderStore {
  walletOrder: Address[];
  saveWalletOrder: (newWalletOrder: Address[]) => void;
  deleteWalletOrder: ({ removedAddress }: { removedAddress: Address }) => void;
}

export const walletOrderStore = createStore<WalletOrderStore>(
  (set, get) => ({
    walletOrder: [],
    saveWalletOrder: (newWalletOrder) => {
      set({ walletOrder: newWalletOrder });
    },
    deleteWalletOrder: ({ removedAddress }) => {
      const walletOrder = get().walletOrder;
      const newWalletOrder = walletOrder.filter(
        (addr) => addr !== removedAddress,
      );
      set({ walletOrder: newWalletOrder });
    },
  }),
  {
    persist: {
      name: 'walletOrder',
      version: 0,
    },
  },
);

export const useWalletOrderStore = withSelectors(create(walletOrderStore));
