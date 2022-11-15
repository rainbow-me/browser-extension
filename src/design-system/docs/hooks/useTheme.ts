import { useEffect, useRef, useState } from 'react';
import { ColorContext } from '../../styles/designTokens';
import { getTheme, setTheme } from '../../styles/theme';

export function useTheme() {
  const toggleCount = useRef(0);
  const [theme, setThemeState] = useState<ColorContext>(() => {
    const { savedTheme, systemTheme } = getTheme();
    return savedTheme || systemTheme || 'dark';
  });

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  function toggleTheme() {
    setTheme(nextTheme);
    setThemeState(nextTheme);
    toggleCount.current += 1;

    if (toggleCount.current > 10) {
      window.open('https://youtu.be/G5CZ58CBGtg?t=14');
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      toggleCount.current = 0;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return { theme, nextTheme, toggleTheme };
}
