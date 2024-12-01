import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface FlashbotsEnabledStore {
  flashbotsEnabled: boolean;
  swapFlashbotsEnabled: boolean;
  setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled: boolean) => void;
}

interface V0FlashbotsEnabledStore {
  flashbotsEnabled: boolean;
}

export const flashbotsEnabledStore = createStore<FlashbotsEnabledStore>(
  (set) => ({
    flashbotsEnabled: false,
    swapFlashbotsEnabled: false,
    setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled) =>
      set({ swapFlashbotsEnabled: newSwapFlashbotsEnabled }),
  }),
  {
    persist: {
      name: 'flashbotsEnabled',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const v0PersistedState = persistedState as V0FlashbotsEnabledStore;
          return {
            ...v0PersistedState,
            swapFlashbotsEnabled: false,
          } as FlashbotsEnabledStore;
        }
        return persistedState as FlashbotsEnabledStore;
      },
    },
  },
);

export const useFlashbotsEnabledStore = create(flashbotsEnabledStore);
