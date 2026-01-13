import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from '../_internal';

export interface IsDefaultWalletState {
  isDefaultWallet: boolean;
  setIsDefaultWallet: (isDefaultWallet: boolean) => void;
}

export const useIsDefaultWalletStore = createBaseStore<IsDefaultWalletState>(
  (set) => ({
    isDefaultWallet: true,
    setIsDefaultWallet: (newIsDefaultWallet) =>
      set({ isDefaultWallet: newIsDefaultWallet }),
  }),
  createExtensionStoreOptions({
    storageKey: 'isDefaultWallet',
    version: 0,
  }),
);
