import { currentThemeStore } from '~/core/state/currentSettings/currentTheme';

import { ColorContext } from './designTokens';
import { getTheme, rootThemeClasses } from './theme';

export function initThemingCritical({
  defaultTheme,
  enableSaved = true,
}: { defaultTheme?: ColorContext; enableSaved?: boolean } = {}) {
  document.addEventListener('DOMContentLoaded', () => {
    // const savedTheme = 'dark'; // Default to 'light' if nothing is saved
    // const className = savedTheme === 'dark' ? 'darkTheme' : 'lightTheme';
    document.documentElement.classList.add('dt');
  });
  const setTheme = (theme: ColorContext) => {
    document.documentElement.classList.remove(
      ...Object.values(rootThemeClasses),
    );
    document.documentElement.classList.add(
      rootThemeClasses[theme === 'dark' ? 'darkTheme' : 'lightTheme'],
    );
  };

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const { savedTheme, systemTheme } = getTheme();
  const theme =
    (enableSaved ? savedTheme : undefined) ||
    defaultTheme ||
    systemTheme ||
    'dark';

  setTheme(theme);

  if (!savedTheme) {
    // Update the theme if the user changes their OS preference
    darkModeMediaQuery.addEventListener('change', ({ matches: isDark }) => {
      setTheme(isDark ? 'dark' : 'light');

      currentThemeStore.setState({
        currentTheme: isDark ? 'dark' : 'light',
      });
    });
  }
}
