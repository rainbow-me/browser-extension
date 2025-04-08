import {
  ar,
  enUS,
  es,
  fr,
  hi,
  id,
  ja,
  ko,
  ptBR,
  ru,
  th,
  tr,
  zhCN,
} from 'date-fns/locale';

import { Language } from '../languages';
import { useCurrentLanguageStore } from '../state';

/**
 * Maps our `Language` string to `date-fns/locale` Locale values
 *
 * `date-fns/locale has no default export. So there is no point
 * in attempting to synchronize our `Language` strings with their
 * locale keys. This object will need to updated each time we
 * add a new supported language
 */
export const locales: Record<Language, Locale> = {
  ar_AR: ar,
  en_US: enUS,
  es_419: es,
  fr_FR: fr,
  hi_IN: hi,
  id_ID: id,
  ja_JP: ja,
  ko_KR: ko,
  pt_BR: ptBR,
  ru_RU: ru,
  th_TH: th,
  tr_TR: tr,
  zh_CN: zhCN,
};

// return date-fns Locale object based on currentLanguage
export function getLocale(): Locale {
  const { currentLanguage } = useCurrentLanguageStore.getState();
  return locales[currentLanguage];
}
