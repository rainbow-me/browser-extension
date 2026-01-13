import { createBaseStore } from '@storesjs/stores';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';

import { createExtensionStoreOptions } from '../_internal';

export interface DegenModeState {
  isDegenModeEnabled: boolean;
  toggleDegenMode: () => void;
}

export const useDegenMode = createBaseStore<DegenModeState>(
  (set) => ({
    isDegenModeEnabled: false,
    toggleDegenMode: () => {
      set((state) => {
        const newIsDegenModeEnabled = !state.isDegenModeEnabled;
        void analytics.track(event.toggledDegenMode, {
          enabled: newIsDegenModeEnabled,
        });
        return { isDegenModeEnabled: newIsDegenModeEnabled };
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'degenMode',
    version: 1,
  }),
);
