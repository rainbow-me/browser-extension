import { Symbols } from '~/entries/popup/components/SFSymbol/SFSymbol';

export interface ThemeOption {
  symbol: Symbols;
  label: string;
}
export const themeOptions: { [key: string]: ThemeOption } = {
  system: { symbol: 'gearshapeFill', label: 'System' },
  light: { symbol: 'boltFill', label: 'Light' },
  dark: { symbol: 'moonStars', label: 'Dark' },
};
