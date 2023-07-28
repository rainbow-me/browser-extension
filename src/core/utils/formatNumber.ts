import { currentCurrencyStore } from '../state';

export const createNumberFormatter = (options?: Intl.NumberFormatOptions) => {
  const formatter = new Intl.NumberFormat(navigator.language, {
    minimumSignificantDigits: 3,
    maximumSignificantDigits: 4,
    minimumFractionDigits: 2,
    ...options,
  });
  return {
    formatToParts: (n: number | undefined | null | string) =>
      formatter.formatToParts(n ? +n : 0),
    format: (n: number | undefined | null | string) =>
      formatter.format(n ? +n : 0),
  };
};

export const formatNumber = createNumberFormatter().format;

export const createCurrencyFormatter = (
  options?: Intl.NumberFormatOptions,
  currency = currentCurrencyStore.getState().currentCurrency,
) => {
  const formatter = createNumberFormatter({
    style: 'currency',
    currency,
    ...options,
  });
  return {
    ...formatter,
    formatToParts: (n: number | string = 0) => {
      const parts = formatter.formatToParts(+n);
      const symbolIndex = parts.findIndex((p) => p.type === 'currency');
      const value = parts.reduce(
        (v, p) => (p.type !== 'currency' ? v + p.value : v),
        '',
      );

      return {
        symbolAtStart: symbolIndex === 0, // some locales put the symbol at the end
        symbol: parts[symbolIndex].value,
        value,
        raw: parts.reduce((result, p) => result + p.value, ''),
      };
    },
  };
};

export const formatCurrency = createCurrencyFormatter().format;
export const formatCurrencyParts = createCurrencyFormatter().formatToParts;

export type FormattedCurrencyParts = ReturnType<typeof formatCurrencyParts>;
