import { Symbols } from '~/entries/popup/components/SFSymbol/SFSymbol';

export type ThemeType = 'light' | 'dark' | 'system';

export interface ThemeOption {
  symbol: Symbols;
  label: string;
}
export const themeOptions: { [key in ThemeType]: ThemeOption } = {
  system: { symbol: 'gearshapeFill', label: 'System' },
  light: { symbol: 'boltFill', label: 'Light' },
  dark: { symbol: 'moonStars', label: 'Dark' },
};
