import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface HiddenWalletsStore {
  hiddenWallets: { [address: Address]: boolean };
  hideWallet: ({ address }: { address: Address }) => void;
  unhideWallet: ({ address }: { address: Address }) => void;
}

export const useHiddenWalletsStore = createRainbowStore<HiddenWalletsStore>(
  (set, get) => ({
    hiddenWallets: {},
    hideWallet: ({ address }) => {
      const hiddenWallets = get().hiddenWallets;
      const newHiddenWallets = {
        ...hiddenWallets,
        [address]: true,
      };
      set({ hiddenWallets: newHiddenWallets });
    },
    unhideWallet: ({ address }) => {
      const hiddenWallets = get().hiddenWallets;
      delete hiddenWallets[address];
      set({ hiddenWallets: { ...hiddenWallets } });
    },
  }),
  {
    storageKey: 'hiddenWallets',
    version: 0,
  },
);
