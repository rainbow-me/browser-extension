import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface WalletOrderStore {
  walletOrder: Address[];
  saveWalletOrder: (newWalletOrder: Address[]) => void;
  deleteWalletOrder: ({ removedAddress }: { removedAddress: Address }) => void;
}

export const useWalletOrderStore = createRainbowStore<WalletOrderStore>(
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
    storageKey: 'walletOrder',
    version: 0,
  },
);
