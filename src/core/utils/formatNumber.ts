/* eslint-disable default-param-last */
import { useCurrentCurrencyStore } from '../state';

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
  const currency = useCurrentCurrencyStore.getState().currentCurrency;
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

/**
 * Formats a currency value with a "<" symbol when the value is below a threshold.
 * Ensures the "<" symbol is placed before the currency symbol for consistent display.
 *
 * @param value - The numeric value to format
 * @param threshold - The threshold value (default: 0.01)
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted string with "<" symbol placed correctly (e.g., "<$0.01" or "<0.01 $")
 */
export const formatCurrencyWithThreshold = (
  value: number | string,
  threshold = 0.01,
  options?: Intl.NumberFormatOptions,
): string => {
  const numValue = +value;
  const shouldShowLessThan = numValue <= threshold;

  if (!shouldShowLessThan) {
    return formatCurrency(value, options);
  }

  // Format with threshold value to get proper currency parts
  const parts = formatCurrencyParts(threshold, options);

  // Place "<" before the currency symbol for consistent display
  if (parts.symbolAtStart) {
    return `<${parts.symbol}${parts.value}`;
  }
  return `<${parts.value} ${parts.symbol}`;
};
