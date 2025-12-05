import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface LastActivityStore {
  lastActivity: string | null;
  recordActivity: () => void;
  clearLastActivity: () => void;
}

export const useLastActivityStore = createBaseStore<LastActivityStore>(
  (set) => ({
    lastActivity: null,
    recordActivity: () => set({ lastActivity: new Date().toJSON() }),
    clearLastActivity: () => set({ lastActivity: null }),
  }),
  createExtensionStoreOptions({
    storageKey: 'lastActivity',
    area: 'session',
    version: 0,
  }),
);
