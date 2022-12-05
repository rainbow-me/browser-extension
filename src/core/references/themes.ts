import { ThemeData, ThemeOption } from '../types/settings';

export const themeOptions: { [key in ThemeOption]: ThemeData } = {
  system: { symbol: 'gear', label: 'System' },
  light: { symbol: 'sun.max', label: 'Light' },
  dark: { symbol: 'moon', label: 'Dark' },
};
