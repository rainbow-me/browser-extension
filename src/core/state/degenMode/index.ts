import { createBaseStore } from 'stores';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';

import { createExtensionStoreOptions } from '../_internal';

export const useDegenMode = createBaseStore(
  () => ({
    isDegenModeEnabled: false,
  }),
  createExtensionStoreOptions({
    storageKey: 'degenMode',
    version: 1,
  }),
);

export const toggleDegenMode = () =>
  useDegenMode.setState((s) => {
    analytics.track(event.toggledDegenMode, {
      enabled: !s.isDegenModeEnabled,
    });
    return { isDegenModeEnabled: !s.isDegenModeEnabled };
  });
