import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface DeveloperToolsEnabledState {
  developerToolsEnabled: boolean;
  setDeveloperToolsEnabled: (developerToolsEnabled: boolean) => void;
}

export const useDeveloperToolsEnabledStore =
  createBaseStore<DeveloperToolsEnabledState>(
    (set) => ({
      developerToolsEnabled: false,
      setDeveloperToolsEnabled: (developerToolsEnabled) =>
        set({ developerToolsEnabled }),
    }),
    createExtensionStoreOptions({
      storageKey: 'developerTools',
      version: 0,
    }),
  );
