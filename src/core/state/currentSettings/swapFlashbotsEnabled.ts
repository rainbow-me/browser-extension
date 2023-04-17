import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface SwapFlashbotsEnabledState {
  swapFlashbotsEnabled: boolean;
  setSwapFlashbotsEnabled: (swapFlashbotsEnabled: boolean) => void;
}

export const swapFlashbotsEnabledStore = createStore<SwapFlashbotsEnabledState>(
  (set) => ({
    swapFlashbotsEnabled: false,
    setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled) =>
      set({ swapFlashbotsEnabled: newSwapFlashbotsEnabled }),
  }),
  {
    persist: {
      name: 'flashbotsEnabled',
      version: 0,
    },
  },
);

export const useSwapFlashbotsEnabledStore = create(swapFlashbotsEnabledStore);
