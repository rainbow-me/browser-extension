import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface CurrentFlashbotsState {
  currentFlashbots: boolean;
  setCurrentFlashbots: (flashbots: boolean) => void;
}

export const currentFlashbotsStore = createStore<CurrentFlashbotsState>(
  (set) => ({
    currentFlashbots: false,
    setCurrentFlashbots: (newFlashbots) =>
      set({ currentFlashbots: newFlashbots }),
  }),
  {
    persist: {
      name: 'currentFlashbots',
      version: 0,
    },
  },
);

export const useCurrentFlashbotsStore = create(currentFlashbotsStore);
