import { type Address } from 'viem';
import create from 'zustand';

import { createStore } from '../internal/createStore';

type SavedNamesStore = {
  savedNames: Record<Address, string>;
  save: (name: string, address: Address) => void;
};

export const savedEnsNamesStore = createStore<SavedNamesStore>(
  (set, get) => ({
    savedNames: {},
    save(name, address) {
      const savedNames = get().savedNames;
      savedNames[address] = name;
      set({ savedNames });
    },
  }),
  { persist: { name: 'ensSavedNames', version: 0 } },
);

export const useSavedEnsNames = create(savedEnsNamesStore);
