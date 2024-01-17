import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { ThemeOption } from '~/core/types/settings';
import { setTheme } from '~/design-system/styles/theme';

export interface CurrentThemeState {
  currentTheme: Exclude<ThemeOption, 'system'>;
  currentUserSelectedTheme: ThemeOption;
  setCurrentTheme: (theme: ThemeOption) => void;
}

export const currentThemeStore = createStore<CurrentThemeState>(
  (set) => ({
    currentTheme: 'dark',
    currentUserSelectedTheme: 'dark',
    setCurrentTheme: (newTheme) => {
      if (newTheme === 'system') {
        const prefersDarkMode = window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches;

        const currentTheme = prefersDarkMode ? 'dark' : 'light';
        set({ currentTheme, currentUserSelectedTheme: 'system' });
        setTheme(currentTheme);
      } else {
        set({ currentTheme: newTheme, currentUserSelectedTheme: newTheme });
        setTheme(newTheme);
      }
    },
  }),
  {
    persist: {
      name: 'currentTheme',
      version: 0,
    },
  },
);

export const useCurrentThemeStore = create(currentThemeStore);
