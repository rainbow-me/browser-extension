import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

export interface ErrorState {
  error: Error | null;
  setError: (e: Error | null) => void;
}

export const errorStore = createStore<ErrorState>((set) => ({
  error: null,
  setError: (error) => set({ error }),
}));

export const useErrorStore = withSelectors(errorStore);
