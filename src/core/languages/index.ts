/* eslint-disable @typescript-eslint/no-explicit-any */
import { I18n } from 'i18n-js';

import { fetchJsonLocally } from '../utils/localJson';

export enum Language {
  EN_US = 'en_US',
  ES_419 = 'es_419',
  FR_FR = 'fr_FR',
  JA_JP = 'ja_JP',
  PT_BR = 'pt_BR',
  ZH_CN = 'zh_CN',
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
    label: 'Português',
  },
  [Language.ZH_CN]: {
    label: '中文',
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

let i18n: I18n, changeI18nLanguage: (locale: Language) => void;

const initLanguages = async () => {
  const {
    en_US,
    es_419,
    fr_FR,
    hi_IN,
    ja_JP,
    pt_BR,
    ru_RU,
    tr_TR,
    zh_CN,
  }: any = await Promise.all([
    await fetchJsonLocally('languages/en_US.json'),
    await fetchJsonLocally('languages./es_419.json'),
    await fetchJsonLocally('languages/fr_FR.json'),
    await fetchJsonLocally('languages/hi_IN.json'),
    await fetchJsonLocally('languages/ja_JP.json'),
    await fetchJsonLocally('languages/pt_BR.json'),
    await fetchJsonLocally('languages/ru_RU.json'),
    await fetchJsonLocally('languages/tr_TR.json'),
    await fetchJsonLocally('languages/zh_CN.json'),
  ]);

  i18n = new I18n({
    en_US,
    es_419,
    fr_FR,
    ja_JP,
    pt_BR,
    zh_CN,
    hi_IN,
    tr_TR,
    ru_RU,
  });

  // Configure languages
  i18n.defaultLocale = Language.EN_US;
  i18n.locale = Language.EN_US;
  i18n.enableFallback = true;

  changeI18nLanguage = (locale: Language) => {
    i18n.locale = locale;
  };
};

initLanguages();

export { i18n, changeI18nLanguage };
