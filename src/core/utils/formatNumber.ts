/* eslint-disable default-param-last */
import { currentCurrencyStore } from '../state';

export const createNumberFormatter = (options?: Intl.NumberFormatOptions) => {
  const formatter = new Intl.NumberFormat(navigator.language, {
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 4,
    ...options,
  });
  return {
    formatToParts: (n: number | undefined | null | string) =>
      formatter.formatToParts(n ? +n : 0),
    format: (n: number | undefined | null | string) =>
      formatter.format(n ? +n : 0),
  };
};

export const formatNumber = (
  n: number | undefined | null | string,
  options?: Intl.NumberFormatOptions,
) => createNumberFormatter(options).format(n);

export const formatCurrencyParts = (
  n: number | string = 0,
  options?: Intl.NumberFormatOptions,
) => {
  const currency = currentCurrencyStore.getState().currentCurrency;
  const formatter = createNumberFormatter({
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    // roundingPriority exists and is widely available but ts is complaining https://github.com/microsoft/TypeScript/issues/52072
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    roundingPriority: 'morePrecision',
    ...options,
  });

  const parts = formatter.formatToParts(+n);
  const symbolIndex = parts.findIndex((p) => p.type === 'currency');
  if (currency === 'ETH') parts[symbolIndex].value = 'Ξ';

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
};
export type FormattedCurrencyParts = ReturnType<typeof formatCurrencyParts>;

export const formatCurrency = (
  n: number | string = 0,
  options?: Intl.NumberFormatOptions,
) => formatCurrencyParts(n, options).raw.split(/\s/).join('');
