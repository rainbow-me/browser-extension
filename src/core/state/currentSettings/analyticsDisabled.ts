import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { getBrowser } from '~/entries/popup/hooks/useBrowser';

export interface AnalyticsDisabledState {
  analyticsDisabled: boolean;
  setAnalyticsDisabled: (analyticsDisabled: boolean) => void;
}

export const analyticsDisabledStore =
  createRainbowStore<AnalyticsDisabledState>(
    (set) => ({
      analyticsDisabled: getBrowser() === 'Firefox',
      setAnalyticsDisabled: (newanalyticsDisabled) =>
        set({ analyticsDisabled: newanalyticsDisabled }),
    }),
    {
      storageKey: 'analyticsDisabled',
      version: 1,
    },
  );

export const useAnalyticsDisabledStore = analyticsDisabledStore;
