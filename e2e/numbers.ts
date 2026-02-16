import { formatUnits } from 'viem';

export type BigNumberish = number | string | bigint;

export const convertRawAmountToDecimalFormat = (
  value: BigNumberish,
  decimals = 18,
): string => formatUnits(BigInt(value), decimals);

export const subtract = (
  numberOne: BigNumberish,
  numberTwo: BigNumberish,
): string => {
  const a = BigInt(numberOne);
  const b = BigInt(numberTwo);
  return (a - b).toString();
};
