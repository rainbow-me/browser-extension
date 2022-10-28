import { I18n } from 'i18n-js';

import en from './_english.json';
import fr from './_french.json';
import pr from './_portuguese.json';
import es from './_spanish.json';

enum Language {
  ES = 'es',
  EN = 'en',
  FR = 'fr',
  PR = 'pr',
}

const i18n = new I18n({
  en,
  es,
  fr,
  pr,
});

// Configure languages
i18n.defaultLocale = 'en';
i18n.locale = 'en';

const changeI18nLanguage = (locale: Language) => {
  i18n.locale = locale;
};

export { changeI18nLanguage, i18n, Language };
