import { createBaseStore } from '@storesjs/stores';

export interface ErrorState {
  error: Error | null;
  setError: (e: Error | null) => void;
}

export const useErrorStore = createBaseStore<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));
