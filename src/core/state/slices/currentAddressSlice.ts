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
  currentAddress: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
});
