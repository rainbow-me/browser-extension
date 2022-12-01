import create from 'zustand';

import { AutoLockTimerOptionType } from '~/core/references/autoLockTimer';
import { createStore } from '~/core/state/internal/createStore';

export interface AutoLockTimerState {
  autoLockTimer: AutoLockTimerOptionType;
  setAutoLockTimer: (autoLockTimer: AutoLockTimerOptionType) => void;
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
