import create from 'zustand';
import { SupportedCurrencyKey } from '../references';
import { createStore } from './internal/createStore';

export interface CurrentCurrencyState {
  currentCurrency: SupportedCurrencyKey;
  setCurrentCurrency: (address: SupportedCurrencyKey) => void;
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

export const useCurrentCurrencyStore = create(currentCurrencyStore);
