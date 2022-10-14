import create from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import {
  CurrentAddressSliceState,
  currentAddressSlice,
} from './slices/currentAddressSlice';

export type CoreStoreState = CurrentAddressSliceState;

export const useCoreStore = create<CoreStoreState>()(
  persist(
    (...props) => ({
      ...currentAddressSlice(...props),
    }),
    { name: 'store:core', getStorage: () => persistStorage },
  ),
);
