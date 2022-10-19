import create from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import {
  CurrentAddressSliceState,
  currentAddressSlice,
} from './slices/currentAddressSlice';

export type PopupStoreState = CurrentAddressSliceState;

// The usePopupStore hook is to be used exclusively for global state that is
// needed in the popup.ts context of the app.
export const usePopupStore = create<PopupStoreState>()(
  persist(
    (...props) => ({
      ...currentAddressSlice(...props),
    }),
    { name: 'store:background', getStorage: () => persistStorage },
  ),
);
