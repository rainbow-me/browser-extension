import { I18n } from 'i18n-js';

import en_US from './en_US.json';

export enum Language {
  EN_US = 'en_US',
  ES_419 = 'es_419',
}

export const i18n = new I18n({
  en_US,
});

// Configure languages
i18n.defaultLocale = Language.EN_US;
i18n.locale = Language.EN_US;

export const changeI18nLanguage = (locale: Language) => {
  i18n.locale = locale;
};

export const supportedLanguages = {
  [Language.EN_US]: {
    label: i18n.t('settings.language.en_us'),
  },
  [Language.ES_419]: {
    label: i18n.t('settings.language.es_419'),
  },
};

export type SupportedLanguage = typeof supportedLanguages;
export type SupportedLanguageKey = keyof SupportedLanguage;
