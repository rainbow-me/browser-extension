import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export const useDegenMode = createRainbowStore(
  () => ({
    isDegenModeEnabled: false,
  }),
  {
    storageKey: 'degenMode',
    version: 1,
  },
);

export const toggleDegenMode = () =>
  useDegenMode.setState((s) => {
    analytics.track(event.toggledDegenMode, {
      enabled: !s.isDegenModeEnabled,
    });
    return { isDegenModeEnabled: !s.isDegenModeEnabled };
  });
