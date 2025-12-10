import { createBaseStore } from 'stores';

import { createExtensionStoreOptions } from '../_internal';

export interface SoundState {
  soundsEnabled: boolean;
  toggleSoundsEnabled: (enabled: boolean) => void;
}

export const useSoundStore = createBaseStore<SoundState>(
  (set) => ({
    soundsEnabled: true,
    toggleSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
  }),
  createExtensionStoreOptions({
    storageKey: 'sound',
    version: 0,
  }),
);
