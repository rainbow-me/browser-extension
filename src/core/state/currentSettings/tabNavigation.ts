import { createBaseStore } from '@storesjs/stores';

// eslint-disable-next-line boundaries/element-types
import type { Tab } from '~/entries/popup/components/Tabs/TabBar';

import { createExtensionStoreOptions } from '../_internal';

interface TabNavigationState {
  selectedTab: Tab;
  setSelectedTab: (newSelectedTab: Tab) => void;
}

export const useTabNavigation = createBaseStore<TabNavigationState>(
  (set) => ({
    selectedTab: 'tokens',
    setSelectedTab: (newSelectedTab) => set({ selectedTab: newSelectedTab }),
  }),
  createExtensionStoreOptions({
    storageKey: 'tabNavigation',
    version: 1,
    migrate(persistedState, version) {
      if (version === 0) {
        return {}; // Use defaults, points was replaced with rewards
      }
      return persistedState as TabNavigationState;
    },
  }),
);
