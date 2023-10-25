import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface TestnetModeState {
  testnetMode: boolean;
  testnetModeShortcutEnabled: boolean;
  setTestnetMode: (testnetMode: boolean) => void;
  setTestnetModeShortcutEnabled: (testnetModeShortcutEnabled: boolean) => void;
}

export const testnetModeStore = createStore<TestnetModeState>(
  (set) => ({
    testnetMode: false,
    testnetModeShortcutEnabled: false,
    setTestnetMode: (testnetMode) => set({ testnetMode }),
    setTestnetModeShortcutEnabled: (testnetModeShortcutEnabled) =>
      set({ testnetModeShortcutEnabled }),
  }),
  {
    persist: {
      name: 'testnetMode',
      version: 0,
    },
  },
);

export const useTestnetModeStore = create(testnetModeStore);
