import { create } from 'zustand';

import { createStore } from '~/core/state/internal/createStore';

export interface DeveloperToolsEnabledState {
  developerToolsEnabled: boolean;
  setDeveloperToolsEnabled: (developerToolsEnabled: boolean) => void;
}

export const developerToolsEnabledStore =
  createStore<DeveloperToolsEnabledState>(
    (set) => ({
      developerToolsEnabled: false,
      setDeveloperToolsEnabled: (developerToolsEnabled) =>
        set({ developerToolsEnabled }),
    }),
    {
      persist: {
        name: 'developerTools',
        version: 0,
      },
    },
  );

export const useDeveloperToolsEnabledStore = create(developerToolsEnabledStore);
