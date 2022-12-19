import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

export interface CurrentChainIdState {
  currentChainId: number;
  setCurrentChainId: (chainId: number) => void;
}

export const currentChainIdStore = createStore<CurrentChainIdState>(
  (set) => ({
    currentChainId: ChainId.mainnet,
    setCurrentChainId: (newChainId) => set({ currentChainId: newChainId }),
  }),
  {
    persist: {
      name: 'currentChainId',
      version: 0,
    },
  },
);

export const useCurrentChainIdStore = create(currentChainIdStore);
