import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from './internal/createStore';

export interface CurrentAddressState {
  currentAddress: Address | null;
  setCurrentAddress: (address: Address) => void;
}

export const currentAddressStore = createStore<CurrentAddressState>(
  (set) => ({
    currentAddress: null,
    setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
  }),
  {
    persist: {
      name: 'currentAddress',
      version: 0,
    },
  },
);

export const useCurrentAddressStore = create(currentAddressStore);
