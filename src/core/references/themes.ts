import { i18n } from '../languages';
import { ThemeData, ThemeOption } from '../types/settings';

export const themeOptions: { [key in ThemeOption]: ThemeData } = {
  system: { symbol: 'gear', label: i18n.t('settings.theme.system') },
  light: { symbol: 'sun.max', label: i18n.t('settings.theme.light') },
  dark: { symbol: 'moon', label: i18n.t('settings.theme.dark') },
};
