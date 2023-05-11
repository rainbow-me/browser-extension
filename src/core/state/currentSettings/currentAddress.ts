import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface CurrentAddressState {
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
}

export const currentAddressStore = createStore<CurrentAddressState>(
  (set) => ({
    currentAddress: '' as Address,
    setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
  }),
  {
    persist: {
      name: 'currentAddress',
      version: 0,
    },
  },
);

export const setCurrentAddress = (address: Address) =>
  useCurrentAddressStore.setState({ currentAddress: address });

export const useCurrentAddressStore = create(currentAddressStore);
