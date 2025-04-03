import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface HideSmallBalancesState {
  hideSmallBalances: boolean;
  setHideSmallBalances: (hideSmallBalances: boolean) => void;
}

export const hideSmallBalancesStore = createStore<HideSmallBalancesState>(
  (set) => ({
    hideSmallBalances: false,
    setHideSmallBalances: (newHideSmallBalances) =>
      set({ hideSmallBalances: newHideSmallBalances }),
  }),
  {
    persist: {
      name: 'hideSmallBalances',
      version: 0,
    },
  },
);

export const useHideSmallBalancesStore = create(() =>
  hideSmallBalancesStore.getState(),
);
