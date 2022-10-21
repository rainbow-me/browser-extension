import { StateCreator } from 'zustand';
import { PopupStoreState } from '../popupStore';

export interface CurrentCurrencySliceState {
  currentCurrency?: string;
  setCurrentCurrency: (address: string) => void;
}

export const currentCurrencySlice: StateCreator<
  PopupStoreState,
  [['zustand/persist', unknown]],
  [],
  CurrentCurrencySliceState
> = (set) => ({
  currentCurrency: 'usd',
  setCurrentCurrency: (newCurrency) => set({ currentCurrency: newCurrency }),
});
