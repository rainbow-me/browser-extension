import { chain } from 'wagmi';
import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface CurrentChainIdState {
  currentChainId: number;
  setCurrentChainId: (chainId: number) => void;
}

export const currentChainIdStore = createStore<CurrentChainIdState>(
  (set) => ({
    currentChainId: chain.mainnet.id,
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
