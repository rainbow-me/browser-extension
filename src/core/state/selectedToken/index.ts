import create from 'zustand';

import { ParsedAddressAsset } from '~/core/types/assets';

import { createStore } from '../internal/createStore';

export interface SelectedTokenState {
  getSelectedToken: () => ParsedAddressAsset | null;
  setSelectedToken: (token?: ParsedAddressAsset) => void;
  selectedToken: ParsedAddressAsset | null;
}

export const selectedTokenStore = createStore<SelectedTokenState>(
  (set, get) => ({
    getSelectedToken: () => get()?.selectedToken,
    setSelectedToken: (selectedToken?: ParsedAddressAsset) => {
      set({ selectedToken });
    },
    selectedToken: null,
  }),
);

export const useSelectedTokenStore = create(selectedTokenStore);
