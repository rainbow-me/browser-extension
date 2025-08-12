import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber';
import BigNumber from 'bignumber.js';
import { isNil } from 'lodash';

import { supportedCurrencies } from '~/core/references';
import { maskInput } from '~/entries/popup/components/InputMask/utils';

import { formatCurrency } from './formatNumber';
import { BigNumberish } from './hex';

type nativeCurrencyType = typeof supportedCurrencies;

export const toBigNumber = (v?: string | number | BigNumber) =>
  v ? EthersBigNumber.from(v) : undefined;

export const abs = (value: BigNumberish): string =>
  new BigNumber(value).abs().toFixed();

export const subtract = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => new BigNumber(numberOne).minus(new BigNumber(numberTwo)).toFixed();

export const convertAmountToRawAmount = (
  value: BigNumberish,
  decimals: number | string,
): string =>
  new BigNumber(value).times(new BigNumber(10).pow(decimals)).toFixed();

export const isZero = (value: BigNumberish): boolean =>
  new BigNumber(value).isZero();

export const toFixedDecimals = (
  value: BigNumberish,
  decimals: number,
): string => new BigNumber(value).toFixed(decimals);

export const convertNumberToString = (value: BigNumberish): string =>
  new BigNumber(value).toFixed();

export const greaterThan = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): boolean => new BigNumber(numberOne).gt(numberTwo);

export const greaterThanOrEqualTo = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): boolean => new BigNumber(numberOne).gte(numberTwo);

export const add = (numberOne: BigNumberish, numberTwo: BigNumberish): string =>
  new BigNumber(numberOne).plus(numberTwo).toFixed();

export const minus = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => new BigNumber(numberOne).minus(numberTwo).toFixed();

export const multiply = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => new BigNumber(numberOne).times(numberTwo).toFixed();

export const addBuffer = (
  numberOne: BigNumberish,
  buffer: BigNumberish = '1.2',
): string => new BigNumber(numberOne).times(buffer).toFixed(0);

export const divide = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => {
  if (!(numberOne || numberTwo)) return '0';
  return new BigNumber(numberOne).dividedBy(numberTwo).toFixed();
};

export const fraction = (
  target: BigNumberish,
  numerator: BigNumberish,
  denominator: BigNumberish,
): string => {
  if (!target || !numerator || !denominator) return '0';
  return new BigNumber(target)
    .times(numerator)
    .dividedBy(denominator)
    .toFixed(0);
};

/**
 * @desc convert to asset amount units from native price value units
 * @param  {String}   value
 * @param  {Object}   asset
 * @param  {Number}   priceUnit
 * @return {String}
 */
export const convertAmountFromNativeValue = (
  value: BigNumberish,
  priceUnit: BigNumberish,
  decimals = 18,
): string => {
  if (isNil(priceUnit) || isZero(priceUnit)) return '0';
  return new BigNumber(
    new BigNumber(value)
      .dividedBy(priceUnit)
      .toFixed(decimals, BigNumber.ROUND_DOWN),
  ).toFixed();
};

export const lessThan = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): boolean => new BigNumber(numberOne).lt(numberTwo);

export const lessOrEqualThan = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): boolean =>
  new BigNumber(numberOne).lt(numberTwo) ||
  new BigNumber(numberOne).eq(numberTwo);

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
  let dec;
  if (lessThan(new BigNumber(value).abs(), 1)) {
    dec = new BigNumber(value).toFixed()?.slice?.(2).search(/[^0]/g) + buffer;
    dec = Math.min(decimals, 8);
  } else {
    dec = Math.min(decimals, buffer);
  }
  const result = new BigNumber(new BigNumber(value).toFixed(dec)).toFixed();
  const resultBN = new BigNumber(result);
  return resultBN.dp() <= 2
    ? resultBN.toFormat(skipDecimals ? 0 : 2)
    : resultBN.toFormat();
};

export const handleSignificantDecimalsAsNumber = (
  value: BigNumberish,
  decimals: number,
): string => {
  return new BigNumber(
    new BigNumber(multiply(value, new BigNumber(10).pow(decimals))).toFixed(0),
  )
    .dividedBy(new BigNumber(10).pow(decimals))
    .toFixed();
};

/**
 * @desc convert from asset BigNumber amount to native price BigNumber amount
 */
const convertAmountToNativeAmount = (
  amount: BigNumberish,
  priceUnit: BigNumberish,
): string => multiply(amount, priceUnit);

/**
 * @desc convert from amount to display formatted string
 */
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

/**
 * @desc convert from raw amount to display formatted string
 */
export const convertRawAmountToNativeDisplay = (
  rawAmount: BigNumberish,
  assetDecimals: number,
  priceUnit: BigNumberish,
  nativeCurrency: keyof nativeCurrencyType,
  buffer?: number,
) => {
  const assetBalance = convertRawAmountToDecimalFormat(
    rawAmount,
    assetDecimals,
  );
  const ret = convertAmountAndPriceToNativeDisplay(
    assetBalance,
    priceUnit,
    nativeCurrency,
    buffer,
  );
  return ret;
};

/**
 * @desc convert from raw amount to balance object
 */
export const convertRawAmountToBalance = (
  value: BigNumberish,
  asset: { decimals: number; symbol?: string },
  buffer?: number,
) => {
  const decimals = asset?.decimals ?? 18;
  const assetBalance = convertRawAmountToDecimalFormat(value, decimals);

  return {
    amount: assetBalance,
    display: convertAmountToBalanceDisplay(assetBalance, asset, buffer),
  };
};

/**
 * @desc convert from amount value to display formatted string
 */
export const convertAmountToBalanceDisplay = (
  value: BigNumberish,
  asset: { decimals: number; symbol?: string },
  buffer?: number,
) => {
  const decimals = asset?.decimals ?? 18;
  const display = handleSignificantDecimals(value, decimals, buffer);
  return `${display} ${asset?.symbol || ''}`;
};

/**
 * @desc convert from amount to display formatted string
 */
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

/**
 * @desc convert from amount value to display formatted string
 */
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
    return `${nativeSelected.symbol}${display}`;
  }
  return `${display} ${nativeSelected.symbol}`;
};

/**
 * @desc convert from raw amount to decimal format
 */
export const convertRawAmountToDecimalFormat = (
  value: BigNumberish,
  decimals = 18,
): string =>
  new BigNumber(value).dividedBy(new BigNumber(10).pow(decimals)).toFixed();

/**
 * @desc convert from decimal format to raw amount
 */
export const convertDecimalFormatToRawAmount = (
  value: string,
  decimals = 18,
): string =>
  new BigNumber(value).multipliedBy(new BigNumber(10).pow(decimals)).toFixed(0);

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
