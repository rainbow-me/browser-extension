import { currentCurrencyStore } from '../state';

export const createCurrencyFormatter = (
  options?: Intl.NumberFormatOptions,
  currency = currentCurrencyStore.getState().currentCurrency,
) => {
  const formatter = new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    ...options,
  });
  return (n?: number | null) => (n ? formatter.format(n) : n);
};
