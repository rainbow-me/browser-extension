import { createStore } from '~/core/state/internal/createStore';
import { Tab } from '~/entries/popup/components/Tabs/TabBar';

interface TabNavigationState {
  selectedTab: Tab;
  setSelectedTab: (newSelectedTab: Tab) => void;
}

const tabNavigationStore = createStore<TabNavigationState>(
  (set) => ({
    selectedTab: 'tokens',
    setSelectedTab: (newSelectedTab) => set({ selectedTab: newSelectedTab }),
  }),
  {
    persist: {
      name: 'tabNavigation',
      version: 0,
    },
  },
);

export const useTabNavigation = tabNavigationStore;
