import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

type SavedNamesStore = {
  savedNames: Record<Address, string>;
  save: (name: string, address: Address) => void;
};

export const useSavedEnsNamesStore = createRainbowStore<SavedNamesStore>(
  (set, get) => ({
    savedNames: {},
    save(name, address) {
      const savedNames = get().savedNames;
      savedNames[address] = name;
      set({ savedNames });
    },
  }),
  { storageKey: 'ensSavedNames', version: 0 },
);
