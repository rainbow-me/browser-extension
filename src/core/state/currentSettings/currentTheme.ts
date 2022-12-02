import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { ThemeOption } from '~/core/types/settings';

export interface CurrentThemeState {
  currentTheme: ThemeOption;
  setCurrentTheme: (theme: ThemeOption) => void;
}

export const currentThemeStore = createStore<CurrentThemeState>(
  (set) => ({
    currentTheme: 'dark',
    setCurrentTheme: (newTheme) => set({ currentTheme: newTheme }),
  }),
  {
    persist: {
      name: 'currentTheme',
      version: 0,
    },
  },
);

export const useCurrentThemeStore = create(currentThemeStore);
