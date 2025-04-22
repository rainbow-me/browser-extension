import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { AutoLockTimerOption } from '~/core/types/settings';

export interface AutoLockTimerState {
  autoLockTimer: AutoLockTimerOption;
  setAutoLockTimer: (autoLockTimer: AutoLockTimerOption) => void;
}

export const useAutoLockTimerStore = createRainbowStore<AutoLockTimerState>(
  (set) => ({
    autoLockTimer: 'none',
    setAutoLockTimer: (newAutoLockTimer) =>
      set({ autoLockTimer: newAutoLockTimer }),
  }),
  {
    storageKey: 'autoLockTimer',
    version: 0,
  },
);
