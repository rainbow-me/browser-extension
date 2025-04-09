import { createRainbowStore } from '~/core/state/internal/createRainbowStore';

export interface SoundState {
  soundsEnabled: boolean;
  toggleSoundsEnabled: (enabled: boolean) => void;
}

export const useSoundStore = createRainbowStore<SoundState>(
  (set) => ({
    soundsEnabled: true,
    toggleSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
  }),
  {
    storageKey: 'sound',
    version: 0,
  },
);
