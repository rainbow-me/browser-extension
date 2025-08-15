import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface AnalyticsDisabledState {
  analyticsDisabled: boolean;
  setAnalyticsDisabled: (analyticsDisabled: boolean) => void;
}

export const useAnalyticsDisabledStore =
  createRainbowStore<AnalyticsDisabledState>(
    (set) => ({
      analyticsDisabled: false,
      setAnalyticsDisabled: (newanalyticsDisabled) =>
        set({ analyticsDisabled: newanalyticsDisabled }),
    }),
    {
      storageKey: 'analyticsDisabled',
      version: 1,
    },
  );
