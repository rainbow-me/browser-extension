import { StateCreator } from 'zustand';
import { PopupStoreState } from '../popupStore';
import { SupportedCurrencyKey } from '~/core/references';

export interface CurrentCurrencySliceState {
  currentCurrency?: SupportedCurrencyKey;
  setCurrentCurrency: (address: SupportedCurrencyKey) => void;
}

export const currentCurrencySlice: StateCreator<
  PopupStoreState,
  [['zustand/persist', unknown]],
  [],
  CurrentCurrencySliceState
> = (set) => ({
  currentCurrency: 'USD',
  setCurrentCurrency: (newCurrency: SupportedCurrencyKey) =>
    set({ currentCurrency: newCurrency }),
});
