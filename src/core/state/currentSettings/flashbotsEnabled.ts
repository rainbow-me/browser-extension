import create from 'zustand';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
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
      analytics.track(
        newFlashbotsEnabled
          ? event.settingsFlashbotsEnabled
          : event.settingsFlashbotsDisabled,
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
    setSwapFlashbotsEnabled: (newSwapFlashbotsEnabled: boolean) => {
      set({ swapFlashbotsEnabled: newSwapFlashbotsEnabled });
    },
  }),
  {
    persist: {
      name: 'flashbotsEnabled',
      version: 1,
      migrate(persistedState, version) {
        const state = (persistedState || {}) as FlashbotsEnabledState;
        if (version === 0) {
          state.swapFlashbotsEnabled ??= !!state.flashbotsEnabled;
        }
        return state;
      },
    },
  },
);

export const useFlashbotsEnabledStore = create(flashbotsEnabledStore);
