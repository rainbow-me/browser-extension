import { createStore } from '../internal/createStore';

export interface SoundState {
  soundsEnabled: boolean;
  toggleSoundsEnabled: (enabled: boolean) => void;
}

export const soundStore = createStore<SoundState>(
  (set) => ({
    soundsEnabled: true,
    toggleSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
  }),
  {
    persist: {
      name: 'sound',
      version: 0,
    },
  },
);

export const useSoundStore = soundStore;
