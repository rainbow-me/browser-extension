import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface AnalyticsDisabledState {
  analyticsDisabled: boolean;
  setAnalyticsDisabled: (analyticsDisabled: boolean) => void;
}

export const analyticsDisabledStore = createStore<AnalyticsDisabledState>(
  (set) => ({
    analyticsDisabled: false,
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

export const useAnalyticsDisabledStore = create(analyticsDisabledStore);
