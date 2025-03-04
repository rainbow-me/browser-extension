import { Address } from 'viem';

import { createStore } from '../internal/createStore';

export interface HiddenWalletsStore {
  hiddenWallets: { [address: Address]: boolean };
  hideWallet: ({ address }: { address: Address }) => void;
  unhideWallet: ({ address }: { address: Address }) => void;
}

export const hiddenWalletsStore = createStore<HiddenWalletsStore>(
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
    persist: {
      name: 'hiddenWallets',
      version: 0,
    },
  },
);

export const useHiddenWalletsStore = hiddenWalletsStore;
