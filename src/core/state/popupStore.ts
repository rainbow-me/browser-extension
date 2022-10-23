import create from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import {
  CurrentCurrencySliceState,
  currentCurrencySlice,
} from './slices/currentCurrencySlice';

export type PopupStoreState = CurrentCurrencySliceState;

// The usePopupStore hook is to be used exclusively for global state that is
// needed in the popup.ts context of the app.
export const usePopupStore = create<PopupStoreState>()(
  persist(
    (...props) => ({
      ...currentCurrencySlice(...props),
    }),
    { name: 'store:popup', getStorage: () => persistStorage },
  ),
);
