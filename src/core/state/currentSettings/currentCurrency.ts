import { SupportedCurrencyKey } from '~/core/references';
import { createStore } from '~/core/state/internal/createStore';

export interface CurrentCurrencyState {
  currentCurrency: SupportedCurrencyKey;
  setCurrentCurrency: (currency: SupportedCurrencyKey) => void;
}

export const currentCurrencyStore = createStore<CurrentCurrencyState>(
  (set) => ({
    currentCurrency: 'USD',
    setCurrentCurrency: (newCurrency) => set({ currentCurrency: newCurrency }),
  }),
  {
    persist: {
      name: 'currentCurrency',
      version: 0,
    },
  },
);

export const useCurrentCurrencyStore = currentCurrencyStore;
