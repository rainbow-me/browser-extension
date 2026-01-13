import { createBaseStore } from '@storesjs/stores';

import { Language, changeI18nLanguage, i18n } from '~/core/languages';
import { fetchJsonLocally } from '~/core/utils/localJson';

import { createExtensionStoreOptions } from '../_internal';

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

export const useCurrentLanguageStore = createBaseStore<CurrentLanguageState>(
  (set) => ({
    currentLanguage: Language.EN_US,
    setCurrentLanguage: async (newLanguage) => {
      await loadTranslation(newLanguage);
      changeI18nLanguage(newLanguage);
      set({ currentLanguage: newLanguage });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'currentLanguage',
    version: 1,
  }),
);
