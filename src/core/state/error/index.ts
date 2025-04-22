import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface ErrorState {
  error: Error | null;
  setError: (e: Error | null) => void;
}

export const useErrorStore = createRainbowStore<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));
