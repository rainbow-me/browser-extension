import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface HideSmallBalancesState {
  hideSmallBalances: boolean;
  setHideSmallBalances: (hideSmallBalances: boolean) => void;
}

export const useHideSmallBalancesStore =
  createRainbowStore<HideSmallBalancesState>(
    (set) => ({
      hideSmallBalances: false,
      setHideSmallBalances: (newHideSmallBalances) =>
        set({ hideSmallBalances: newHideSmallBalances }),
    }),
    {
      storageKey: 'hideSmallBalances',
      version: 0,
    },
  );
