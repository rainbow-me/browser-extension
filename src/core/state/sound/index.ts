import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

import { withSelectors } from '../internal/withSelectors';

export interface SoundState {
  soundsEnabled: boolean;
  toggleSoundsEnabled: (enabled: boolean) => void;
}

export const soundStore = createRainbowStore<SoundState>(
  (set) => ({
    soundsEnabled: true,
    toggleSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
  }),
  {
    storageKey: 'sound',
    version: 0,
  },
);

export const useSoundStore = withSelectors(soundStore);
