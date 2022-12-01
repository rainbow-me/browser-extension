import create from 'zustand';

import { AutoLockTimerOption } from '~/core/references/autoLockTimer';
import { createStore } from '~/core/state/internal/createStore';

export interface AutoLockTimerState {
  autoLockTimer: AutoLockTimerOption;
  setAutoLockTimer: (autoLockTimer: AutoLockTimerOption) => void;
}

export const autoLockTimerStore = createStore<AutoLockTimerState>(
  (set) => ({
    autoLockTimer: 'none',
    setAutoLockTimer: (newAutoLockTimer) =>
      set({ autoLockTimer: newAutoLockTimer }),
  }),
  {
    persist: {
      name: 'autoLockTimer',
      version: 0,
    },
  },
);

export const useAutoLockTimerStore = create(autoLockTimerStore);
