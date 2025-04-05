import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import { withSelectors } from '../internal/withSelectors';

interface PersistedAddressState {
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
}

const persistedAddressStore = createRainbowStore<PersistedAddressState>(
  (set) => ({
    currentAddress: '' as Address,
    setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
  }),
  {
    storageKey: 'currentAddress',
    version: 0,
  },
);

interface RapidAddressState {
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
}

export const currentAddressStore = createRainbowStore<RapidAddressState>(
  (set) => ({
    currentAddress:
      // Default to the persisted current address
      persistedAddressStore.getState().currentAddress || ('' as Address),
    setCurrentAddress: (newAddress) => {
      if (newAddress !== persistedAddressStore.getState().currentAddress) {
        set({ currentAddress: newAddress });
        // Automatically persist in the background to the persisted store
        persistedAddressStore.getState().setCurrentAddress(newAddress);
      }
    },
  }),
);

// Synchronize currentAddress with persistedAddress once rehydrated
persistedAddressStore.subscribe((state) => {
  // If persistedAddress changes and currentAddress is still the default, update it
  if (currentAddressStore.getState().currentAddress === ('' as Address)) {
    currentAddressStore.setState({ currentAddress: state.currentAddress });
  }
});

export const useCurrentAddressStore = withSelectors(currentAddressStore);
