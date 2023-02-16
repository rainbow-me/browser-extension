import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { DEFAULT_ACCOUNT } from '~/core/utils/defaults';

export interface CurrentAddressState {
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
}

export const currentAddressStore = createStore<CurrentAddressState>(
  (set) => ({
    currentAddress: DEFAULT_ACCOUNT,
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
