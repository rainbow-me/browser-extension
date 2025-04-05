import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface TestnetModeState {
  testnetMode: boolean;
  setTestnetMode: (testnetMode: boolean) => void;
}

export const testnetModeStore = createRainbowStore<TestnetModeState>(
  (set) => ({
    testnetMode: false,
    setTestnetMode: (testnetMode) => set({ testnetMode }),
  }),
  {
    storageKey: 'testnetMode',
    version: 0,
  },
);

export const useTestnetModeStore = testnetModeStore;
