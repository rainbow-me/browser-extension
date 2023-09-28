/* eslint-disable @typescript-eslint/no-explicit-any */
import { I18n } from 'i18n-js';

import en_US from 'static/json/languages/en_US.json';

export enum Language {
  EN_US = 'en_US',
  ES_419 = 'es_419',
  FR_FR = 'fr_FR',
  JA_JP = 'ja_JP',
  PT_BR = 'pt_BR',
  ZH_CN = 'zh_CN',
  ID_ID = 'id_ID',
  HI_IN = 'hi_IN',
  TR_TR = 'tr_TR',
  RU_RU = 'ru_RU',
}

export const supportedLanguages = {
  [Language.EN_US]: {
    label: 'English',
  },
  [Language.ES_419]: {
    label: 'Español',
  },
  [Language.FR_FR]: {
    label: 'Français',
  },
  [Language.JA_JP]: {
    label: '日本語',
  },
  [Language.PT_BR]: {
    label: 'português brasileiro',
  },
  [Language.ZH_CN]: {
    label: '中文',
  },
  [Language.ID_ID]: {
    label: 'Bahasa Indonesia',
  },
  [Language.HI_IN]: {
    label: 'हिंदी',
  },
  [Language.TR_TR]: {
    label: 'Türkçe',
  },
  [Language.RU_RU]: {
    label: 'Русский',
  },
};

export type SupportedLanguage = typeof supportedLanguages;
export type SupportedLanguageKey = keyof SupportedLanguage;

export const i18n = new I18n({
  en_US,
});

// Configure languages
i18n.defaultLocale = Language.EN_US;
i18n.locale = Language.EN_US;
i18n.enableFallback = true;

export const changeI18nLanguage = (locale: Language) => {
  i18n.locale = locale;
};
