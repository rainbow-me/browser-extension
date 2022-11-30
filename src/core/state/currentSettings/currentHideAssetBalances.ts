import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CurrentHideAssetBalancesState {
  currentHideAssetBalances: boolean;
  setCurrentHideAssetBalances: (hideAssetBalances: boolean) => void;
}

export const currentHideAssetBalancesStore =
  createStore<CurrentHideAssetBalancesState>(
    (set) => ({
      currentHideAssetBalances: false,
      setCurrentHideAssetBalances: (newHideAssetBalances) =>
        set({ currentHideAssetBalances: newHideAssetBalances }),
    }),
    {
      persist: {
        name: 'currentHideAssetBalances',
        version: 0,
      },
    },
  );

export const useCurrentHideAssetBalancesStore = create(
  currentHideAssetBalancesStore,
);
