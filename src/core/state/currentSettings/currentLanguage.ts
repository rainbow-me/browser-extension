import create from 'zustand';

import { Language, changeI18nLanguage, i18n } from '~/core/languages';
import { createStore } from '~/core/state/internal/createStore';
import { fetchJsonLocally } from '~/core/utils/localJson';

export interface CurrentLanguageState {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
}

export const currentLanguageStore = createStore<CurrentLanguageState>(
  (set) => ({
    currentLanguage: Language.EN_US,
    setCurrentLanguage: async (newLanguage) => {
      const newLangDict = await fetchJsonLocally(
        `languages/${newLanguage}.json`,
      );
      i18n.translations[newLanguage] = newLangDict;
      changeI18nLanguage(newLanguage);
      set({ currentLanguage: newLanguage });
    },
  }),
  {
    persist: {
      name: 'currentLanguage',
      version: 1,
    },
  },
);

export const useCurrentLanguageStore = create(currentLanguageStore);
