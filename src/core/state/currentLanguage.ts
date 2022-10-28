import create from 'zustand';
import { changeI18nLanguage, Language } from '~/core/languages';
import { createStore } from './internal/createStore';

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
    },
  },
);

export const useCurrentLanguageStore = create(currentLanguageStore);
