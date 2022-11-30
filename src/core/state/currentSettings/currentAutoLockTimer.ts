import create from 'zustand';

import { AutoLockTimerOptionType } from '~/core/references/autoLockTimer';

import { createStore } from '../internal/createStore';

export interface CurrentAutoLockTimerState {
  currentAutoLockTimer: AutoLockTimerOptionType;
  setCurrentAutoLockTimer: (autoLockTimer: AutoLockTimerOptionType) => void;
}

export const currentAutoLockTimerStore = createStore<CurrentAutoLockTimerState>(
  (set) => ({
    currentAutoLockTimer: 'none',
    setCurrentAutoLockTimer: (newAutoLockTimer) =>
      set({ currentAutoLockTimer: newAutoLockTimer }),
  }),
  {
    persist: {
      name: 'currentAutoLockTimer',
      version: 0,
    },
  },
);

export const usecurrentAutoLockTimerStore = create(currentAutoLockTimerStore);
