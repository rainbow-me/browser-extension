import { Language, changeI18nLanguage, i18n } from '~/core/languages';
import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { fetchJsonLocally } from '~/core/utils/localJson';

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

export const useCurrentLanguageStore = createRainbowStore<CurrentLanguageState>(
  (set) => ({
    currentLanguage: Language.EN_US,
    setCurrentLanguage: async (newLanguage) => {
      await loadTranslation(newLanguage);
      changeI18nLanguage(newLanguage);
      set({ currentLanguage: newLanguage });
    },
  }),
  {
    storageKey: 'currentLanguage',
    version: 1,
  },
);
