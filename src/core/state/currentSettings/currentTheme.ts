import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { ThemeOption } from '~/core/types/settings';

import { withSelectors } from '../internal/withSelectors';

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

        set({
          currentTheme: prefersDarkMode ? 'dark' : 'light',
          currentUserSelectedTheme: 'system',
        });
      } else {
        set({ currentTheme: newTheme, currentUserSelectedTheme: newTheme });
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

export const useCurrentThemeStore = withSelectors(create(currentThemeStore));
