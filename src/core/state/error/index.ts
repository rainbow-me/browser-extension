import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface ErrorState {
  error: Error | null;
  setError: (e: Error | null) => void;
}

export const errorStore = createStore<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));

export const useErrorStore = create(errorStore);
