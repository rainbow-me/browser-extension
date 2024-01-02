import create from 'zustand';

import { event } from '~/analytics/event';
import { createStore } from '~/core/state/internal/createStore';

export interface FlashbotsEnabledStore {
  flashbotsEnabled: boolean;
  setFlashbotsEnabled: (flashbotsEnabled: boolean) => void;
  swapFlashbotsEnabled: boolean;
  setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled: boolean) => void;
}

interface V0FlashbotsEnabledStore {
  flashbotsEnabled: boolean;
  setFlashbotsEnabled: (flashbotsEnabled: boolean) => void;
}

export const flashbotsEnabledStore = createStore<FlashbotsEnabledStore>(
  (set) => ({
    flashbotsEnabled: false,
    setFlashbotsEnabled: (newFlashbotsEnabled) => {
      import('~/analytics').then(({ analytics }) =>
        analytics.track(
          newFlashbotsEnabled
            ? event.settingsFlashbotsEnabled
            : event.settingsFlashbotsDisabled,
        ),
      );
      set({
        flashbotsEnabled: newFlashbotsEnabled,
        // swapFlashbotsEnabled is just a way to override when flashbotsEnabled is false
        // specifically for the swap page
        // so if we enable it globally we can just set it to true
        ...(newFlashbotsEnabled && { swapFlashbotsEnabled: true }),
      });
    },
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
