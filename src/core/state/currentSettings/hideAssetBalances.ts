import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface HideAssetBalancesState {
  hideAssetBalances: boolean;
  setHideAssetBalances: (hideAssetBalances: boolean) => void;
}

export const useHideAssetBalancesStore =
  createBaseStore<HideAssetBalancesState>(
    (set) => ({
      hideAssetBalances: false,
      setHideAssetBalances: (newHideAssetBalances) =>
        set({ hideAssetBalances: newHideAssetBalances }),
    }),
    createExtensionStoreOptions({
      storageKey: 'hideAssetBalances',
      version: 0,
    }),
  );
