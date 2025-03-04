import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface HideAssetBalancesState {
  hideAssetBalances: boolean;
  setHideAssetBalances: (hideAssetBalances: boolean) => void;
}

export const hideAssetBalancesStore = createStore<HideAssetBalancesState>(
  (set) => ({
    hideAssetBalances: false,
    setHideAssetBalances: (newHideAssetBalances) =>
      set({ hideAssetBalances: newHideAssetBalances }),
  }),
  {
    persist: {
      name: 'hideAssetBalances',
      version: 0,
    },
  },
);

export const useHideAssetBalancesStore = create(hideAssetBalancesStore);
