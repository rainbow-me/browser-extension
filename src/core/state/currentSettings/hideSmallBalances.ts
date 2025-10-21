import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface HideSmallBalancesState {
  hideSmallBalances: boolean;
  setHideSmallBalances: (hideSmallBalances: boolean) => void;
}

export const useHideSmallBalancesStore =
  createRainbowStore<HideSmallBalancesState>(
    (set) => ({
      hideSmallBalances: true,
      setHideSmallBalances: (newHideSmallBalances) =>
        set({ hideSmallBalances: newHideSmallBalances }),
    }),
    {
      storageKey: 'hideSmallBalances',
      version: 1,
      migrate(persistedState, version) {
        if (!persistedState || version === 0) {
          // The default value gets persisted too
          return {
            // that's why we need to set the new default value here; This will overwrite user preferences, which is okay in this specific case
            hideSmallBalances: true,
          };
        }

        return persistedState;
      },
    },
  );
