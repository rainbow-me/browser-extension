import create from 'zustand';

import { createStore } from './internal/createStore';

export interface CurrentCurrencyState {
  currentCurrency: string;
  setCurrentCurrency: (address: string) => void;
}

export const currentCurrencyStore = createStore<CurrentCurrencyState>(
  (set) => ({
    currentCurrency: 'usd',
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
