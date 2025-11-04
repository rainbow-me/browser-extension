import { createBaseStore } from 'stores';

import { ParsedUserAsset } from '~/core/types/assets';

export interface SelectedTokenState {
  getSelectedToken: () => ParsedUserAsset | null;
  setSelectedToken: (token?: ParsedUserAsset) => void;
  selectedToken: ParsedUserAsset | null;
}

export const useSelectedTokenStore = createBaseStore<SelectedTokenState>(
  (set, get) => ({
    getSelectedToken: () => get()?.selectedToken,
    setSelectedToken: (selectedToken?: ParsedUserAsset) => {
      set({ selectedToken });
    },
    selectedToken: null,
  }),
);
