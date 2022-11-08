import { I18n } from 'i18n-js';

import en from './_english.json';

enum Language {
  EN = 'en',
  ES = 'es',
}

const i18n = new I18n({
  en,
});

// Configure languages
i18n.defaultLocale = 'en';
i18n.locale = 'en';

const changeI18nLanguage = (locale: Language) => {
  i18n.locale = locale;
};

export { changeI18nLanguage, i18n, Language };
