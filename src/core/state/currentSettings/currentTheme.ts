import { ThemeOption } from '~/core/types/settings';

import { createRainbowStore } from '../internal/createRainbowStore';
import { withSelectors } from '../internal/withSelectors';

export interface CurrentThemeState {
  currentTheme: Exclude<ThemeOption, 'system'>;
  currentUserSelectedTheme: ThemeOption;
  setCurrentTheme: (theme: ThemeOption) => void;
}

export const currentThemeStore = createRainbowStore<CurrentThemeState>(
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
        localStorage.setItem('theme', prefersDarkMode ? 'dark' : 'light');
      } else {
        set({ currentTheme: newTheme, currentUserSelectedTheme: newTheme });
        localStorage.setItem('theme', newTheme);
      }
    },
  }),
  {
    storageKey: 'currentTheme',
    version: 0,
  },
);

export const useCurrentThemeStore = withSelectors(currentThemeStore);
