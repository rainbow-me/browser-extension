import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { getBrowser } from '~/entries/popup/hooks/useBrowser';

export interface AnalyticsDisabledState {
  analyticsDisabled: boolean;
  setAnalyticsDisabled: (analyticsDisabled: boolean) => void;
}

export const analyticsDisabledStore = createStore<AnalyticsDisabledState>(
  (set) => ({
    analyticsDisabled: getBrowser() === 'Firefox',
    setAnalyticsDisabled: (newanalyticsDisabled) =>
      set({ analyticsDisabled: newanalyticsDisabled }),
  }),
  {
    persist: {
      name: 'analyticsDisabled',
      version: 1,
    },
  },
);

export const useAnalyticsDisabledStore = create(() =>
  analyticsDisabledStore.getState(),
);
