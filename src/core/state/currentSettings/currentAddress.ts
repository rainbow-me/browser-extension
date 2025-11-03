import { createBaseStore } from 'stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

interface CurrentAddressState {
  currentAddress: Address;
  setCurrentAddress: (address: Address) => void;
}

export const useCurrentAddressStore = createBaseStore<CurrentAddressState>(
  (set) => ({
    currentAddress: '' as Address,
    setCurrentAddress: (newAddress) => set({ currentAddress: newAddress }),
  }),
  createExtensionStoreOptions({
    storageKey: 'currentAddress',
    version: 0,
  }),
);
