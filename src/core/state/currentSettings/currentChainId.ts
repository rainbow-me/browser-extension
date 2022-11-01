import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CurrentChainIdState {
  currentChainId: number | null;
  setCurrentChainId: (chainId: number) => void;
}

export const currentChainIdStore = createStore<CurrentChainIdState>(
  (set) => ({
    currentChainId: null,
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
