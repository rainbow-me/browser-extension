import { ColorContext } from './designTokens';

export const rootThemeClasses = {
  lightTheme: 'lt',
  darkTheme: 'dt',
};

export const themeClasses = {
  lightTheme: {
    lightContext: 'lt-lc',
    darkContext: 'lt-dc',
  },
  darkTheme: {
    lightContext: 'dt-lc',
    darkContext: 'dt-dc',
  },
};

export function getTheme(): {
  savedTheme: ColorContext | null;
  systemTheme: ColorContext | null;
} {
  const savedTheme =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('rainbow.theme') as ColorContext)
      : null;
  const systemTheme =
    // eslint-disable-next-line no-nested-ternary
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      : null;
  return { savedTheme, systemTheme };
}

export function setTheme(theme: ColorContext) {
  localStorage.setItem('rainbow.theme', theme);
  document.documentElement.classList.remove(...Object.values(rootThemeClasses));
  document.documentElement.classList.add(
    rootThemeClasses[theme === 'dark' ? 'darkTheme' : 'lightTheme'],
  );
}
