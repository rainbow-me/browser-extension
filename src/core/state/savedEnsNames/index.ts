import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import { withSelectors } from '../internal/withSelectors';

type SavedNamesStore = {
  savedNames: Record<Address, string>;
  save: (name: string, address: Address) => void;
};

export const savedEnsNamesStore = createRainbowStore<SavedNamesStore>(
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

export const useSavedEnsNames = withSelectors(savedEnsNamesStore);
