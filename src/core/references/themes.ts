import { i18n } from '../languages';
import { ThemeData, ThemeOption } from '../types/settings';

export const themeOptions: { [key in ThemeOption]: ThemeData } = {
  system: {
    symbol: 'gear',
    label: i18n.t('settings.theme.system'),
    color: 'labelTertiary',
  },
  light: {
    symbol: 'sun.max',
    label: i18n.t('settings.theme.light'),
    color: 'yellow',
  },
  dark: {
    symbol: 'moon',
    label: i18n.t('settings.theme.dark'),
    color: 'purple',
  },
};
