import { StateCreator } from 'zustand';
import { CoreStoreState } from '../coreStore';

export interface CurrentAddressSliceState {
  currentAddress?: string;
  setCurrentAddress: (address: string) => void;
}

export const currentAddressSlice: StateCreator<
  CoreStoreState,
  [['zustand/persist', unknown]],
  [],
  CurrentAddressSliceState
> = (set) => ({
  currentAddress: undefined,
  setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
});
