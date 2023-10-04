import { TranslateOptions } from 'i18n-js';
import { createContext, useCallback, useContext } from 'react';

import { i18n } from '~/core/languages';

const translationContext = createContext<TranslateOptions | undefined>(
  undefined,
);

export const TranslationContext = translationContext.Provider;

export const useTranslationContext = (contextOverride?: TranslateOptions) => {
  const contextOptions = useContext(translationContext);

  return useCallback(
    (s: string | string[], options?: TranslateOptions | undefined) =>
      i18n.t(s, { ...(contextOverride || contextOptions), ...options }),
    [contextOptions, contextOverride],
  );
};
