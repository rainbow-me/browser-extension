import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface DeveloperToolsEnabledState {
  developerToolsEnabled: boolean;
  setDeveloperToolsEnabled: (developerToolsEnabled: boolean) => void;
}

export const useDeveloperToolsEnabledStore =
  createRainbowStore<DeveloperToolsEnabledState>(
    (set) => ({
      developerToolsEnabled: false,
      setDeveloperToolsEnabled: (developerToolsEnabled) =>
        set({ developerToolsEnabled }),
    }),
    {
      storageKey: 'developerTools',
      version: 0,
    },
  );
