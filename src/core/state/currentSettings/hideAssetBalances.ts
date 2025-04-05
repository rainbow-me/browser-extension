import { createRainbowStore } from '../internal/createRainbowStore';

export interface HideAssetBalancesState {
  hideAssetBalances: boolean;
  setHideAssetBalances: (hideAssetBalances: boolean) => void;
}

export const hideAssetBalancesStore =
  createRainbowStore<HideAssetBalancesState>(
    (set) => ({
      hideAssetBalances: false,
      setHideAssetBalances: (newHideAssetBalances) =>
        set({ hideAssetBalances: newHideAssetBalances }),
    }),
    {
      storageKey: 'hideAssetBalances',
      version: 0,
    },
  );

export const useHideAssetBalancesStore = hideAssetBalancesStore;
