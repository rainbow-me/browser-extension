import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface AnalyticsDisabledState {
  analyticsDisabled: undefined | boolean;
  setAnalyticsDisabled: (analyticsDisabled: boolean) => void;
}

export const analyticsDisabledStore = createStore<AnalyticsDisabledState>(
  (set) => ({
    analyticsDisabled: undefined,
    setAnalyticsDisabled: (newanalyticsDisabled) =>
      set({ analyticsDisabled: !newanalyticsDisabled }),
  }),
  {
    persist: {
      name: 'analyticsDisabled',
      version: 1,
    },
  },
);

export const useAnalyticsDisabledStore = create(analyticsDisabledStore);
