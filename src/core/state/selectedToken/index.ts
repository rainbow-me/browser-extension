import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { ParsedUserAsset } from '~/core/types/assets';

import { withSelectors } from '../internal/withSelectors';

export interface SelectedTokenState {
  getSelectedToken: () => ParsedUserAsset | null;
  setSelectedToken: (token?: ParsedUserAsset) => void;
  selectedToken: ParsedUserAsset | null;
}

export const selectedTokenStore = createRainbowStore<SelectedTokenState>(
  (set, get) => ({
    getSelectedToken: () => get()?.selectedToken,
    setSelectedToken: (selectedToken?: ParsedUserAsset) => {
      set({ selectedToken });
    },
    selectedToken: null,
  }),
);

export const useSelectedTokenStore = withSelectors(selectedTokenStore);
