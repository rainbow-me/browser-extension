import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface AnalyticsDisabledState {
  analyticsDisabled: boolean;
  setAnalyticsDisabled: (analyticsDisabled: boolean) => void;
}

export const useAnalyticsDisabledStore =
  createBaseStore<AnalyticsDisabledState>(
    (set) => ({
      analyticsDisabled: false,
      setAnalyticsDisabled: (newanalyticsDisabled) =>
        set({ analyticsDisabled: newanalyticsDisabled }),
    }),
    createExtensionStoreOptions({
      storageKey: 'analyticsDisabled',
      version: 1,
    }),
  );
