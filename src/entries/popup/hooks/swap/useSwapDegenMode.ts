import { analytics } from '~/analytics';
import { createStore } from '~/core/state/internal/createStore';

export const degenModeStore = createStore(
  () => ({
    isDegenModeEnabled: false,
  }),
  {
    persist: {
      name: 'degenMode',
      version: 1,
    },
  },
);

export const useDegenMode = degenModeStore;
export const toggleDegenMode = () =>
  useDegenMode.setState((s) => {
    analytics.track(analytics.event.toggledDegenMode, {
      enabled: !s.isDegenModeEnabled,
    });
    return { isDegenModeEnabled: !s.isDegenModeEnabled };
  });
