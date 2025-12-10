import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface HideSmallBalancesState {
  hideSmallBalances: boolean;
  setHideSmallBalances: (hideSmallBalances: boolean) => void;
}

export const useHideSmallBalancesStore =
  createBaseStore<HideSmallBalancesState>(
    (set) => ({
      hideSmallBalances: false,
      setHideSmallBalances: (newHideSmallBalances) =>
        set({ hideSmallBalances: newHideSmallBalances }),
    }),
    createExtensionStoreOptions({
      storageKey: 'hideSmallBalances',
      version: 2,
      migrate(persistedState, version) {
        if (!persistedState || version <= 1) {
          // The default value gets persisted too
          return {
            // that's why we need to set the new default value here; This will overwrite user preferences, which is okay in this specific case
            hideSmallBalances: false,
          };
        }

        return persistedState;
      },
    }),
  );
