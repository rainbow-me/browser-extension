import { createBaseStore } from '@storesjs/stores';

import { AutoLockTimerOption } from '~/core/types/settings';

import { createExtensionStoreOptions } from '../_internal';

export interface AutoLockTimerState {
  autoLockTimer: AutoLockTimerOption;
  setAutoLockTimer: (autoLockTimer: AutoLockTimerOption) => void;
}

export const useAutoLockTimerStore = createBaseStore<AutoLockTimerState>(
  (set) => ({
    autoLockTimer: 'none',
    setAutoLockTimer: (newAutoLockTimer) =>
      set({ autoLockTimer: newAutoLockTimer }),
  }),
  createExtensionStoreOptions({
    storageKey: 'autoLockTimer',
    version: 0,
  }),
);
