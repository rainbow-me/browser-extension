import { createBaseStore } from '@storesjs/stores';

import { ThemeOption } from '~/core/types/settings';

import { createExtensionStoreOptions } from '../_internal';

export interface CurrentThemeState {
  currentTheme: Exclude<ThemeOption, 'system'>;
  currentUserSelectedTheme: ThemeOption;
  setCurrentTheme: (theme: ThemeOption) => void;
}

export const useCurrentThemeStore = createBaseStore<CurrentThemeState>(
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
  createExtensionStoreOptions({
    storageKey: 'currentTheme',
    version: 0,
  }),
);
