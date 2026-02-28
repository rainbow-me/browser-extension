import { formatUnits } from 'viem';

import { supportedCurrencies } from '~/core/references';
import { maskInput } from '~/entries/popup/components/InputMask/utils';

import { PRECISION, SCALE, decToFixed, fixedToDec } from './dinero';
import { formatCurrency } from './formatNumber';

type BigNumberish = number | string | bigint;
type nativeCurrencyType = typeof supportedCurrencies;

const str = (v: BigNumberish): string => {
  if (v == null) return '0';
  if (typeof v === 'bigint') return v.toString();
  const s = String(v);
  return s === 'NaN' || s === 'undefined' || s === 'null' ? '0' : s;
};

// ---------------------------------------------------------------------------
// Core arithmetic — operates in fixed-point bigint, returns decimal strings
// ---------------------------------------------------------------------------

export const abs = (value: BigNumberish): string => {
  const v = str(value);
  return v.startsWith('-') ? v.slice(1) : v;
};

export const add = (numberOne: BigNumberish, numberTwo: BigNumberish): string =>
  fixedToDec(decToFixed(str(numberOne)) + decToFixed(str(numberTwo)));

export const minus = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string =>
  fixedToDec(decToFixed(str(numberOne)) - decToFixed(str(numberTwo)));

export const multiply = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string =>
  fixedToDec((decToFixed(str(numberOne)) * decToFixed(str(numberTwo))) / SCALE);

export const divide = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => {
  if (!(numberOne || numberTwo)) return '0';
  const b = decToFixed(str(numberTwo));
  if (b === 0n) return '0';
  return fixedToDec((decToFixed(str(numberOne)) * SCALE) / b);
};

export const lessThan = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): boolean => decToFixed(str(numberOne)) < decToFixed(str(numberTwo));

// ---------------------------------------------------------------------------
// Fixed-precision formatting
// ---------------------------------------------------------------------------

export const toFixedDecimals = (
  value: BigNumberish,
  decimals: number,
): string => {
  const fixed = decToFixed(str(value));
  if (decimals >= PRECISION) {
    const result = fixedToDec(fixed);
    const [int = '0', frac = ''] = result.split('.');
    return `${int}.${frac.padEnd(decimals, '0').slice(0, decimals)}`;
  }
  const factor = 10n ** BigInt(PRECISION - decimals);
  const rounded =
    fixed >= 0n
      ? ((fixed + factor / 2n) / factor) * factor
      : ((fixed - factor / 2n) / factor) * factor;
  const result = fixedToDec(rounded);
  const neg = result.startsWith('-');
  const abs = neg ? result.slice(1) : result;
  const [int = '0', frac = ''] = abs.split('.');
  const formatted = `${int}.${frac.padEnd(decimals, '0').slice(0, decimals)}`;
  return neg ? `-${formatted}` : formatted;
};

export const convertAmountFromNativeValue = (
  value: BigNumberish,
  priceUnit: BigNumberish,
  decimals = 18,
): string => {
  if (priceUnit == null) return '0';
  const b = decToFixed(str(priceUnit));
  if (b === 0n) return '0';
  const divResult = (decToFixed(str(value)) * SCALE) / b;
  // truncate to `decimals` places directly on the bigint — no intermediate string
  const factor = 10n ** BigInt(PRECISION - decimals);
  const truncated = (divResult / factor) * factor;
  const result = fixedToDec(truncated);
  const [int = '0', frac = ''] = result.split('.');
  const trimmed = frac.replace(/0+$/, '');
  return trimmed ? `${int}.${trimmed}` : int;
};

// ---------------------------------------------------------------------------
// View-layer display formatters (Number OK here for Intl.NumberFormat)
// ---------------------------------------------------------------------------

const formatWithSeparators = (
  value: string,
  fractionDigits: number,
): string => {
  const n = Number(value);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    useGrouping: true,
  }).format(n);
};

export const handleSignificantDecimalsWithThreshold = (
  value: BigNumberish,
  decimals: number,
  threshold = '0.0001',
) => {
  const result = toFixedDecimals(value, decimals);
  return lessThan(result, threshold) ? `< ${threshold}` : result;
};

export const handleSignificantDecimals = (
  value: BigNumberish,
  decimals: number,
  buffer = 3,
  skipDecimals = false,
): string => {
  // single parse — all comparisons stay in bigint
  const fixed = decToFixed(str(value));
  const absFixed = fixed < 0n ? -fixed : fixed;
  const oneFP = SCALE; // 1.0 in fixed-point = 10^PRECISION
  const absLt1 = absFixed < oneFP;
  const dec = absLt1 ? Math.min(decimals, 8) : Math.min(decimals, buffer);

  const rounded = toFixedDecimals(fixedToDec(fixed), dec);
  const [, frac = ''] = rounded.split('.');
  const trimmedFrac = frac.replace(/0+$/, '');
  const dp = trimmedFrac.length;

  if (dp <= 2) {
    return formatWithSeparators(rounded, skipDecimals ? 0 : 2);
  }
  return formatWithSeparators(rounded, dp);
};

export const handleSignificantDecimalsAsNumber = (
  value: BigNumberish,
  decimals: number,
): string => {
  const fixed = decToFixed(str(value));
  // truncate directly in bigint — no intermediate string
  const factor = 10n ** BigInt(PRECISION - decimals);
  const truncated = (fixed / factor) * factor;
  const result = fixedToDec(truncated);
  const [int = '0', frac = ''] = result.split('.');
  const trimmed = frac.replace(/0+$/, '');
  return trimmed ? `${int}.${trimmed}` : int;
};

// ---------------------------------------------------------------------------
// Monetary conversion functions
// ---------------------------------------------------------------------------

const convertAmountToNativeAmount = (
  amount: BigNumberish,
  priceUnit: BigNumberish,
): string => multiply(amount, priceUnit);

export const convertAmountAndPriceToNativeDisplay = (
  amount: BigNumberish,
  priceUnit: BigNumberish,
  nativeCurrency: keyof nativeCurrencyType,
  buffer?: number,
  skipDecimals = false,
): { amount: string; display: string } => {
  const nativeBalanceRaw = convertAmountToNativeAmount(amount, priceUnit);
  const nativeDisplay = convertAmountToNativeDisplay(
    nativeBalanceRaw,
    nativeCurrency,
    buffer,
    skipDecimals,
  );
  return {
    amount: nativeBalanceRaw,
    display: nativeDisplay,
  };
};

export const convertAmountAndPriceToNativeDisplayWithThreshold = (
  amount: BigNumberish,
  priceUnit: BigNumberish,
  nativeCurrency: keyof nativeCurrencyType,
): { amount: string; display: string } => {
  const nativeBalanceRaw = convertAmountToNativeAmount(amount, priceUnit);
  const nativeDisplay = convertAmountToNativeDisplayWithThreshold(
    nativeBalanceRaw,
    nativeCurrency,
  );
  return {
    amount: nativeBalanceRaw,
    display: nativeDisplay,
  };
};

export const convertRawAmountToNativeDisplay = (
  rawAmount: BigNumberish,
  assetDecimals: number,
  priceUnit: BigNumberish,
  nativeCurrency: keyof nativeCurrencyType,
  buffer?: number,
) => {
  const assetBalance = formatUnits(safeBigInt(rawAmount), assetDecimals);
  return convertAmountAndPriceToNativeDisplay(
    assetBalance,
    priceUnit,
    nativeCurrency,
    buffer,
  );
};

export const safeBigInt = (value: BigNumberish): bigint => {
  if (typeof value === 'bigint') return value;
  const raw = str(value);
  const intPart = raw.split('.')[0] || '0';
  if (/[eE]/.test(intPart)) {
    const n = Number(intPart);
    return Number.isFinite(n) ? BigInt(Math.round(n)) : 0n;
  }
  try {
    return BigInt(intPart);
  } catch {
    return 0n;
  }
};

export const convertRawAmountToBalance = (
  value: BigNumberish,
  asset: { decimals: number; symbol?: string },
  buffer?: number,
) => {
  const decimals = asset?.decimals ?? 18;
  const assetBalance = formatUnits(safeBigInt(value), decimals);

  return {
    amount: assetBalance,
    display: convertAmountToBalanceDisplay(assetBalance, asset, buffer),
  };
};

export const convertAmountToBalanceDisplay = (
  value: BigNumberish,
  asset: { decimals: number; symbol?: string },
  buffer?: number,
) => {
  const decimals = asset?.decimals ?? 18;
  const display = handleSignificantDecimals(value, decimals, buffer);
  return `${display} ${asset?.symbol || ''}`;
};

export const convertAmountToPercentageDisplay = (
  value: BigNumberish,
  buffer?: number,
  skipDecimals?: boolean,
  decimals = 2,
): string => {
  const display = handleSignificantDecimals(
    value,
    decimals,
    buffer,
    skipDecimals,
  );
  return `${display}%`;
};

export const convertAmountToNativeDisplay = (
  value: BigNumberish,
  nativeCurrency: keyof nativeCurrencyType,
  buffer?: number,
  skipDecimals?: boolean,
) => {
  const nativeSelected = supportedCurrencies?.[nativeCurrency];
  const { decimals } = nativeSelected;
  const display = handleSignificantDecimals(
    value,
    decimals,
    buffer,
    skipDecimals,
  );
  if (nativeSelected.alignment === 'left') {
    return `${nativeSelected.symbol}${display}`;
  }
  return `${display} ${nativeSelected.symbol}`;
};

const convertAmountToNativeDisplayWithThreshold = (
  value: BigNumberish,
  nativeCurrency: keyof nativeCurrencyType,
) => {
  const nativeSelected = supportedCurrencies?.[nativeCurrency];
  const display = handleSignificantDecimalsWithThreshold(
    value,
    nativeSelected.decimals,
    nativeSelected.decimals < 4 ? '0.01' : '0.0001',
  );
  if (nativeSelected.alignment === 'left') {
    if (display.startsWith('< ')) {
      return `<${nativeSelected.symbol}${display.slice(2)}`;
    }
    return `${nativeSelected.symbol}${display}`;
  }
  return `${display} ${nativeSelected.symbol}`;
};

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

const cleanNumber = (n: number | string | null | undefined): number => {
  if (typeof n === 'string') {
    return parseFloat(n.replace(/,/g, ''));
  }
  return n || 0;
};

export const formatNumber = (n?: number | string | null) => {
  let value = formatCurrency(cleanNumber(n), {
    notation: 'compact',
    maximumSignificantDigits: 4,
  });
  while (value.charAt(0) === '$') {
    value = value.substring(1);
  }
  return value;
};

export const processExchangeRateArray = (arr: string[]): string[] => {
  return arr.map((item) => {
    const parts = item.split(' ');
    if (parts.length === 5) {
      const formattedAmount = formatNumber(parts[3]);
      return `${parts[0]} ${parts[1]} ${parts[2]} ${formattedAmount} ${parts[4]}`;
    }
    return item;
  });
};

export const truncateNumber = (n: string | number, maxChars = 10): string => {
  const value = typeof n === 'number' ? n.toString() : n;

  if (!value) return '';

  const parts = value.replace(/,/g, '').split('.');
  const integers = parts[0] || '';

  if (integers.length > maxChars) {
    return maskInput({
      inputValue: value,
      decimals: 0,
      integers: maxChars,
    });
  }

  return maskInput({
    inputValue: value,
    decimals: maxChars - integers.length,
    integers: maxChars,
  });
};

export const isExceedingMaxCharacters = (value: string, maxChars: number) => {
  return value.replace('.', '').length > maxChars;
};
