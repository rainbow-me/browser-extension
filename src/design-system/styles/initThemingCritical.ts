import { ColorContext } from './designTokens';
import { getTheme, rootThemeClasses } from './theme';

export function initThemingCritical({
  defaultTheme,
}: { defaultTheme?: ColorContext } = {}) {
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
  const theme = savedTheme || defaultTheme || systemTheme;

  if (theme) setTheme(theme);

  if (!savedTheme) {
    // Update the theme if the user changes their OS preference
    darkModeMediaQuery.addEventListener('change', ({ matches: isDark }) => {
      setTheme(isDark ? 'dark' : 'light');
    });
  }
}
