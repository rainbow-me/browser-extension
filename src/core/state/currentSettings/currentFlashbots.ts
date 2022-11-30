import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CurrentFlashbotsState {
  currentFlashbots: boolean;
  setCurrentFlashbots: (Flashbots: boolean) => void;
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
