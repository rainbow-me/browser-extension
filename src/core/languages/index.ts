/* eslint-disable @typescript-eslint/no-explicit-any */
import { I18n } from 'i18n-js';

import en_US from 'static/json/languages/en_US.json';

export enum Language {
  AR_AR = 'ar_AR',
  EN_US = 'en_US',
  ES_419 = 'es_419',
  FR_FR = 'fr_FR',
  HI_IN = 'hi_IN',
  ID_ID = 'id_ID',
  JA_JP = 'ja_JP',
  KO_KR = 'ko_KR',
  PT_BR = 'pt_BR',
  RU_RU = 'ru_RU',
  TH_TH = 'th_TH',
  TR_TR = 'tr_TR',
  ZH_CN = 'zh_CN',
}

export const supportedLanguages = {
  [Language.EN_US]: {
    label: 'English',
  },
  [Language.ZH_CN]: {
    label: '中文',
  },
  [Language.HI_IN]: {
    label: 'हिंदी',
  },
  [Language.ES_419]: {
    label: 'Español',
  },
  [Language.FR_FR]: {
    label: 'Français',
  },
  [Language.AR_AR]: {
    label: 'العربية',
  },
  [Language.PT_BR]: {
    label: 'Português',
  },
  [Language.RU_RU]: {
    label: 'Русский',
  },
  [Language.ID_ID]: {
    label: 'Bahasa Indonesia',
  },
  [Language.JA_JP]: {
    label: '日本語',
  },
  [Language.TR_TR]: {
    label: 'Türkçe',
  },
  [Language.KO_KR]: {
    label: '한국어',
  },
  [Language.TH_TH]: {
    label: 'ภาษาไทย',
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
