import create from 'zustand';

import { Language, changeI18nLanguage } from '~/core/languages';
import { createStore } from '~/core/state/internal/createStore';

export interface CurrentLanguageState {
  currentLanguage: Language;
  setCurrentLanguage: (language: Language) => void;
}

export const currentLanguageStore = createStore<CurrentLanguageState>(
  (set) => ({
    currentLanguage: Language.EN_US,
    setCurrentLanguage: (newLanguage) => {
      changeI18nLanguage(newLanguage);
      set({ currentLanguage: newLanguage });
    },
  }),
  {
    persist: {
      name: 'currentLanguage',
      version: 0,
    },
  },
);

export const useCurrentLanguageStore = create(currentLanguageStore);
