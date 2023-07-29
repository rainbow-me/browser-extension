import { I18n } from 'i18n-js';

import en_US from './en_US.json';

enum Language {
  EN_US = 'en_US',
  ES_419 = 'es_419',
}

const i18n = new I18n({
  en_US,
});

// Configure languages
i18n.defaultLocale = Language.EN_US;
i18n.locale = Language.EN_US;

const changeI18nLanguage = (locale: Language) => {
  i18n.locale = locale;
};

export { changeI18nLanguage, i18n, Language };
