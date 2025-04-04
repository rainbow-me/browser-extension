import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { Tab } from '~/entries/popup/components/Tabs/TabBar';

interface TabNavigationState {
  selectedTab: Tab;
  setSelectedTab: (newSelectedTab: Tab) => void;
}

const tabNavigationStore = createRainbowStore<TabNavigationState>(
  (set) => ({
    selectedTab: 'tokens',
    setSelectedTab: (newSelectedTab) => set({ selectedTab: newSelectedTab }),
  }),
  {
    storageKey: 'tabNavigation',
    version: 0,
  },
);

export const useTabNavigation = tabNavigationStore;
