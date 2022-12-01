import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface IsFlashbotsEnabledState {
  isFlashbotsEnabled: boolean;
  setIsFlashbotsEnabled: (isFlashbotsEnabled: boolean) => void;
}

export const isFlashbotsEnabledStore = createStore<IsFlashbotsEnabledState>(
  (set) => ({
    isFlashbotsEnabled: false,
    setIsFlashbotsEnabled: (newIsFlashbotsEnabled) =>
      set({ isFlashbotsEnabled: newIsFlashbotsEnabled }),
  }),
  {
    persist: {
      name: 'isFlashbotsEnabled',
      version: 0,
    },
  },
);

export const useIsFlashbotsEnabledStore = create(isFlashbotsEnabledStore);
