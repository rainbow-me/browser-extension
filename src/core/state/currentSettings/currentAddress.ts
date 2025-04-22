import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

interface PersistedAddressState {
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
}

const usePersistedAddressStore = createRainbowStore<PersistedAddressState>(
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

export const useCurrentAddressStore = createRainbowStore<RapidAddressState>(
  (set) => ({
    currentAddress:
      // Default to the persisted current address
      usePersistedAddressStore.getState().currentAddress || ('' as Address),
    setCurrentAddress: (newAddress) => {
      if (newAddress !== usePersistedAddressStore.getState().currentAddress) {
        set({ currentAddress: newAddress });
        // Automatically persist in the background to the persisted store
        usePersistedAddressStore.getState().setCurrentAddress(newAddress);
      }
    },
  }),
);

// Synchronize currentAddress with persistedAddress once rehydrated
usePersistedAddressStore.subscribe((state) => {
  // If persistedAddress changes and currentAddress is still the default, update it
  if (useCurrentAddressStore.getState().currentAddress === ('' as Address)) {
    useCurrentAddressStore.setState({ currentAddress: state.currentAddress });
  }
});
