import { createBaseStore } from 'stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

export interface HiddenWalletsStore {
  hiddenWallets: { [address: Address]: boolean };
  hideWallet: ({ address }: { address: Address }) => void;
  unhideWallet: ({ address }: { address: Address }) => void;
}

export const useHiddenWalletsStore = createBaseStore<HiddenWalletsStore>(
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
  createExtensionStoreOptions({
    storageKey: 'hiddenWallets',
    version: 0,
  }),
);
