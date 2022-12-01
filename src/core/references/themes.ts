import { ThemeData, ThemeOption } from '../types/settings';

export const themeOptions: { [key in ThemeOption]: ThemeData } = {
  system: { symbol: 'gearshapeFill', label: 'System' },
  light: { symbol: 'boltFill', label: 'Light' },
  dark: { symbol: 'moonStars', label: 'Dark' },
};
