import { create } from 'zustand';

import { ParsedUserAsset } from '~/core/types/assets';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

export interface SelectedTokenState {
  getSelectedToken: () => ParsedUserAsset | null;
  setSelectedToken: (token?: ParsedUserAsset) => void;
  selectedToken: ParsedUserAsset | null;
}

export const selectedTokenStore = createStore<SelectedTokenState>(
  (set, get) => ({
    getSelectedToken: () => get()?.selectedToken,
    setSelectedToken: (selectedToken?: ParsedUserAsset) => {
      set({ selectedToken });
    },
    selectedToken: null,
  }),
);

export const useSelectedTokenStore = withSelectors(
  create(() => selectedTokenStore.getState()),
);
