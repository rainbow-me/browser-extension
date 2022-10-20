import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export interface CurrentAddressSliceState {
  currentAddress?: string;
  setCurrentAddress: (address: string) => void;
}

export const currentAddressSlice: StateCreator<
  BackgroundStoreState,
  [['zustand/persist', unknown]],
  [],
  CurrentAddressSliceState
> = (set) => ({
  currentAddress: undefined,
  setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
});
