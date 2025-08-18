import BigNumber from 'bignumber.js';

export type BigNumberish = number | string | BigNumber;

export const convertRawAmountToDecimalFormat = (
  value: BigNumberish,
  decimals = 18,
): string =>
  new BigNumber(value).dividedBy(new BigNumber(10).pow(decimals)).toFixed();

export const subtract = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => new BigNumber(numberOne).minus(new BigNumber(numberTwo)).toFixed();
