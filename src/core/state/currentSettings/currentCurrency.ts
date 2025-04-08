import { SupportedCurrencyKey } from '~/core/references';

import { createRainbowStore } from '../internal/createRainbowStore';

export interface CurrentCurrencyState {
  currentCurrency: SupportedCurrencyKey;
  setCurrentCurrency: (currency: SupportedCurrencyKey) => void;
}

export const useCurrentCurrencyStore = createRainbowStore<CurrentCurrencyState>(
  (set) => ({
    currentCurrency: 'USD',
    setCurrentCurrency: (newCurrency) => set({ currentCurrency: newCurrency }),
  }),
  {
    storageKey: 'currentCurrency',
    version: 0,
  },
);
