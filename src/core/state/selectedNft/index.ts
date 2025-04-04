import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { UniqueAsset } from '~/core/types/nfts';

import { withSelectors } from '../internal/withSelectors';

export interface SelectedNftState {
  setSelectedNft: (nft?: UniqueAsset) => void;
  selectedNft: UniqueAsset | null;
}

export const selectedNftStore = createRainbowStore<SelectedNftState>((set) => ({
  setSelectedNft: (selectedNft?: UniqueAsset) => {
    set({ selectedNft });
  },
  selectedNft: null,
}));

export const useSelectedNftStore = withSelectors(selectedNftStore);
