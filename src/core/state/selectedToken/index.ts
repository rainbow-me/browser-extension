import { createBaseStore } from '@storesjs/stores';

import { ParsedUserAsset } from '~/core/types/assets';

export interface SelectedTokenState {
  setSelectedToken: (token?: ParsedUserAsset) => void;
  selectedToken: ParsedUserAsset | null;
}

export const useSelectedTokenStore = createBaseStore<SelectedTokenState>(
  (set) => ({
    setSelectedToken: (selectedToken?: ParsedUserAsset) =>
      set({ selectedToken: selectedToken ?? null }),
    selectedToken: null,
  }),
);
