import { TranslateOptions } from 'i18n-js';
import { createContext, useCallback, useContext } from 'react';

import { i18n } from '~/core/languages';

const translationContext = createContext<string | undefined>(undefined);

export const TranslationContext = translationContext.Provider;

export const useTranslationContext = (tranlationContextOverride?: string) => {
  const tranlationContext = useContext(translationContext);

  const c = tranlationContextOverride || tranlationContext;

  return useCallback(
    (s: string | string[], options?: TranslateOptions | undefined) =>
      i18n.t(c ? [c, s].flat() : s, options),
    [c],
  );
};
