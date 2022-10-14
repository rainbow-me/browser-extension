import { themeClasses, rootThemeClasses } from './themeClasses';

export function initTheming() {
  const setTheme = (theme: 'dark' | 'light') => {
    document.documentElement.classList.remove(
      ...Object.values(rootThemeClasses),
    );
    document.documentElement.classList.add(
      rootThemeClasses[theme === 'dark' ? 'darkTheme' : 'lightTheme'],
    );
  };

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  setTheme(darkModeMediaQuery.matches ? 'dark' : 'light');

  // Update the theme if the user changes their OS preference
  darkModeMediaQuery.addEventListener('change', ({ matches: isDark }) => {
    setTheme(isDark ? 'dark' : 'light');
  });

  // Set the initial color contexts to match their respective themes
  document.body.classList.add(
    themeClasses.lightTheme.lightContext,
    themeClasses.darkTheme.darkContext,
  );
}
