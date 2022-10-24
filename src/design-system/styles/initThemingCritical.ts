import { rootThemeClasses } from './themeClasses';

type Theme = 'dark' | 'light';

export function initThemingCritical({
  defaultTheme,
}: { defaultTheme?: Theme } = {}) {
  const setTheme = (theme: Theme) => {
    document.documentElement.classList.remove(
      ...Object.values(rootThemeClasses),
    );
    document.documentElement.classList.add(
      rootThemeClasses[theme === 'dark' ? 'darkTheme' : 'lightTheme'],
    );
  };

  if (defaultTheme) {
    setTheme(defaultTheme);
    return;
  }

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  setTheme(darkModeMediaQuery.matches ? 'dark' : 'light');

  // Update the theme if the user changes their OS preference
  darkModeMediaQuery.addEventListener('change', ({ matches: isDark }) => {
    setTheme(isDark ? 'dark' : 'light');
  });
}
