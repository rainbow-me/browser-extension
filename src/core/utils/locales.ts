import locale from 'date-fns/locale';

import { Language } from '../languages';
import { currentLanguageStore } from '../state';

// map our Langugage type to date-fns/locale values
export const locales: Record<Language, Locale> = {
  en: locale['enUS'],
  es: locale['es'],
};

// return date-fns Locale object based on currentLanguage
export function getLocale(): Locale {
  const { currentLanguage } = currentLanguageStore.getState();
  return locales[currentLanguage];
}
