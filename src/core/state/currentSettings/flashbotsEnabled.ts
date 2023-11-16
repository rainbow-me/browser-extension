import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface FlashbotsEnabledState {
  flashbotsEnabled: boolean;
  setFlashbotsEnabled: (flashbotsEnabled: boolean) => void;
  swapFlashbotsEnabled: boolean;
  setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled: boolean) => void;
}

export const flashbotsEnabledStore = createStore<FlashbotsEnabledState>(
  (set) => ({
    flashbotsEnabled: false,
    setFlashbotsEnabled: (newFlashbotsEnabled) => {
      set({ flashbotsEnabled: newFlashbotsEnabled });
      // swapFlashbotsEnabled is just a way to override when flashbotsEnabledGlobally is false
      // specifically for the swap page
      // so if we enable it globally we can just set it to true
      if (newFlashbotsEnabled) set({ swapFlashbotsEnabled: true });
    },
    swapFlashbotsEnabled: false,
    setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled) =>
      set({ swapFlashbotsEnabled: newSwapFlashbotsEnabled }),
  }),
  {
    persist: {
      name: 'flashbotsEnabled',
      version: 1,
    },
  },
);

export const useFlashbotsEnabledStore = create(flashbotsEnabledStore);
