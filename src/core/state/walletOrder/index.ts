import { createBaseStore } from 'stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

export interface WalletOrderStore {
  walletOrder: Address[];
  saveWalletOrder: (newWalletOrder: Address[]) => void;
  deleteWalletOrder: ({ removedAddress }: { removedAddress: Address }) => void;
}

export const useWalletOrderStore = createBaseStore<WalletOrderStore>(
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
  createExtensionStoreOptions({
    storageKey: 'walletOrder',
    version: 0,
  }),
);
