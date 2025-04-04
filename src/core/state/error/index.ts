import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import { withSelectors } from '../internal/withSelectors';

export interface ErrorState {
  error: Error | null;
  setError: (e: Error | null) => void;
}

export const errorStore = createRainbowStore<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));

export const useErrorStore = withSelectors(errorStore);
