import create from 'zustand';

import { createStore } from '../internal/createStore';

export type ThemeType = 'light' | 'dark' | 'system';

export interface CurrentThemeState {
  currentTheme: ThemeType;
  setCurrentTheme: (theme: ThemeType) => void;
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
