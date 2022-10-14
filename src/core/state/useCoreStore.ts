import create from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './persistStorage';
import { boolSlice, BoolSliceState } from './slices/boolSlice';
import {
  CurrentAddressSliceState,
  currentAddressSlice,
} from './slices/currentAddressSlice';

export type CoreStoreState = CurrentAddressSliceState & BoolSliceState;

export const useCoreStore = create<CoreStoreState>()(
  persist(
    (...props) => ({
      ...currentAddressSlice(...props),
      ...boolSlice(...props),
    }),
    { name: 'store:core', getStorage: () => persistStorage },
  ),
);
