import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CurrentHideSmallBalancesState {
  currentHideSmallBalances: boolean;
  setCurrentHideSmallBalances: (HideSmallBalances: boolean) => void;
}

export const currentHideSmallBalancesStore =
  createStore<CurrentHideSmallBalancesState>(
    (set) => ({
      currentHideSmallBalances: true,
      setCurrentHideSmallBalances: (newHideSmallBalances) =>
        set({ currentHideSmallBalances: newHideSmallBalances }),
    }),
    {
      persist: {
        name: 'currentHideSmallBalances',
        version: 0,
      },
    },
  );

export const useCurrentHideSmallBalancesStore = create(
  currentHideSmallBalancesStore,
);
