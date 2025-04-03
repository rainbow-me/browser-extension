import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface TestnetModeState {
  testnetMode: boolean;
  setTestnetMode: (testnetMode: boolean) => void;
}

export const testnetModeStore = createStore<TestnetModeState>(
  (set) => ({
    testnetMode: false,
    setTestnetMode: (testnetMode) => set({ testnetMode }),
  }),
  {
    persist: {
      name: 'testnetMode',
      version: 0,
    },
  },
);

export const useTestnetModeStore = create(() => testnetModeStore.getState());
