import { createBaseStore } from 'stores';

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
    version: 0,
  }),
);
