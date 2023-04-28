import create from 'zustand';

import { Language, changeI18nLanguage } from '~/core/languages';
import { createStore } from '~/core/state/internal/createStore';

export interface CurrentLanguageState {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
}

export const currentLanguageStore = createStore<CurrentLanguageState>(
  (set) => ({
    currentLanguage: Language.EN,
    setCurrentLanguage: (newLanguage) => {
      changeI18nLanguage(newLanguage);
      set({ currentLanguage: newLanguage });
    },
  }),
  {
    persist: {
      name: 'currentLanguage',
      version: 0,
      onRehydrateStorage: ({ currentLanguage } = {} as CurrentLanguageState) =>
        currentLanguage && changeI18nLanguage(currentLanguage),
    },
  },
);

export const useCurrentLanguageStore = create(currentLanguageStore);
