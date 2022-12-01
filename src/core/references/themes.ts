import { Symbols } from '~/entries/popup/components/SFSymbol/SFSymbol';

export type ThemeOption = 'light' | 'dark' | 'system';

export interface ThemeData {
  symbol: Symbols;
  label: string;
}
export const themeOptions: { [key in ThemeOption]: ThemeData } = {
  system: { symbol: 'gearshapeFill', label: 'System' },
  light: { symbol: 'boltFill', label: 'Light' },
  dark: { symbol: 'moonStars', label: 'Dark' },
};
