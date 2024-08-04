import create from 'zustand';

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

export const useDegenMode = create(degenModeStore);
export const toggleDegenMode = () =>
  useDegenMode.setState((s) => ({ isDegenModeEnabled: !s.isDegenModeEnabled }));
