import { useCallback } from 'react';

import { Language, changeI18nLanguage, i18n } from '~/core/languages';
import { fetchJsonLocally } from '~/core/utils/localJson';

import { useSettingsStore } from './store';

export interface CurrentLanguageState {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
}

const isTranslationLoaded = (language: Language) =>
  !!i18n.translations[language];
const loadTranslation = async (language: Language) => {
  if (isTranslationLoaded(language)) return;
  const newLangDict = await fetchJsonLocally(`languages/${language}.json`);
  i18n.translations[language] = newLangDict;
};

export const useCurrentLanguage: () => CurrentLanguageState = () => {
  const [currentLanguage, _setCurrentLanguage] =
    useSettingsStore('currentLanguage');
  const setCurrentLanguage = useCallback(
    async (newLanguage: Language) => {
      await loadTranslation(newLanguage);
      changeI18nLanguage(newLanguage);
      _setCurrentLanguage(newLanguage);
    },
    [_setCurrentLanguage],
  );
  return {
    currentLanguage,
    setCurrentLanguage,
  };
};
