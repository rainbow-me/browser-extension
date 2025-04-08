import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { Tab } from '~/entries/popup/components/Tabs/TabBar';

interface TabNavigationState {
  selectedTab: Tab;
  setSelectedTab: (newSelectedTab: Tab) => void;
}

export const useTabNavigation = createRainbowStore<TabNavigationState>(
  (set) => ({
    selectedTab: 'tokens',
    setSelectedTab: (newSelectedTab) => set({ selectedTab: newSelectedTab }),
  }),
  {
    storageKey: 'tabNavigation',
    version: 0,
  },
);
