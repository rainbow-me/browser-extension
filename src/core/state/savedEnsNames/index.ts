import { createBaseStore } from 'stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

type SavedNamesStore = {
  savedNames: Record<Address, string>;
  save: (name: string, address: Address) => void;
};

export const useSavedEnsNamesStore = createBaseStore<SavedNamesStore>(
  (set, get) => ({
    savedNames: {},
    save(name, address) {
      const savedNames = get().savedNames;
      savedNames[address] = name;
      set({ savedNames });
    },
  }),
  createExtensionStoreOptions({ storageKey: 'ensSavedNames', version: 0 }),
);
