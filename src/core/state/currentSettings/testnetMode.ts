import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface TestnetModeState {
  testnetMode: boolean;
  setTestnetMode: (testnetMode: boolean) => void;
}

export const useTestnetModeStore = createBaseStore<TestnetModeState>(
  (set) => ({
    testnetMode: false,
    setTestnetMode: (testnetMode) => set({ testnetMode }),
  }),
  createExtensionStoreOptions({
    storageKey: 'testnetMode',
    version: 0,
  }),
);
