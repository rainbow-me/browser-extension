import { useCurrentThemeStore } from '~/core/state';

import { ColorContext } from './designTokens';
import { getTheme, rootThemeClasses } from './theme';

export function initThemingCritical({
  defaultTheme,
  enableSaved = true,
}: { defaultTheme?: ColorContext; enableSaved?: boolean } = {}) {
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

      useCurrentThemeStore.setState({
        currentTheme: isDark ? 'dark' : 'light',
      });
    });
  }
}
