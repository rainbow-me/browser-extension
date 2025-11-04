import { createBaseStore } from '@storesjs/stores';

import { UniqueAsset } from '~/core/types/nfts';

export interface SelectedNftState {
  setSelectedNft: (nft?: UniqueAsset) => void;
  selectedNft: UniqueAsset | null;
}

export const useSelectedNftStore = createBaseStore<SelectedNftState>((set) => ({
  setSelectedNft: (selectedNft?: UniqueAsset) => {
    set({ selectedNft });
  },
  selectedNft: null,
}));
