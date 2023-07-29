import { I18n } from 'i18n-js';

import en_US from './en_US.json';
import es_419 from './es_419.json';
import zh_CN from './zh_CN.json';

export enum Language {
  EN_US = 'en_US',
  ES_419 = 'es_419',
  ZH_CN = 'zh_CN',
}

export const i18n = new I18n({
  en_US,
  es_419,
  zh_CN,
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
  [Language.ZH_CN]: {
    label: i18n.t('settings.language.zh_CN'),
  },
};

export type SupportedLanguage = typeof supportedLanguages;
export type SupportedLanguageKey = keyof SupportedLanguage;
