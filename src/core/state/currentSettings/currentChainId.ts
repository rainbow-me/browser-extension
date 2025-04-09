import { ChainId } from '~/core/types/chains';

import { createRainbowStore } from '../internal/createRainbowStore';

export interface CurrentChainIdState {
  currentChainId: number;
  setCurrentChainId: (chainId: number) => void;
}

export const useCurrentChainIdStore = createRainbowStore<CurrentChainIdState>(
  (set) => ({
    currentChainId: ChainId.mainnet,
    setCurrentChainId: (newChainId) => set({ currentChainId: newChainId }),
  }),
  {
    storageKey: 'currentChainId',
    version: 0,
  },
);
