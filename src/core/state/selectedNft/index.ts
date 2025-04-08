import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { UniqueAsset } from '~/core/types/nfts';

export interface SelectedNftState {
  setSelectedNft: (nft?: UniqueAsset) => void;
  selectedNft: UniqueAsset | null;
}

export const useSelectedNftStore = createRainbowStore<SelectedNftState>(
  (set) => ({
    setSelectedNft: (selectedNft?: UniqueAsset) => {
      set({ selectedNft });
    },
    selectedNft: null,
  }),
);
