import { analytics } from '~/analytics';
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
    analytics.track(analytics.event.toggledDegenMode, {
      enabled: !s.isDegenModeEnabled,
    });
    return { isDegenModeEnabled: !s.isDegenModeEnabled };
  });
