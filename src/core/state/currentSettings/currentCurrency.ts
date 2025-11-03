import { createBaseStore } from 'stores';

import { SupportedCurrencyKey } from '~/core/references';

import { createExtensionStoreOptions } from '../_internal';

export interface CurrentCurrencyState {
  currentCurrency: SupportedCurrencyKey;
  setCurrentCurrency: (currency: SupportedCurrencyKey) => void;
}

export const useCurrentCurrencyStore = createBaseStore<CurrentCurrencyState>(
  (set) => ({
    currentCurrency: 'USD',
    setCurrentCurrency: (newCurrency) => set({ currentCurrency: newCurrency }),
  }),
  createExtensionStoreOptions({
    storageKey: 'currentCurrency',
    version: 0,
  }),
);
