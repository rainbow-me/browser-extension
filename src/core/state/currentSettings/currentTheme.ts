import create from 'zustand';

import { ThemeType } from '~/core/references/themes';

import { createStore } from '../internal/createStore';

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
