import { BigNumber as EthersBigNumber } from '@ethersproject/bignumber';
import { Bytes, isBytes, isHexString } from '@ethersproject/bytes';
import BigNumber from 'bignumber.js';
import { startsWith } from 'lodash';

export type BigNumberish = number | string | BigNumber;

/**
 * @desc Checks if a hex string, ignoring prefixes and suffixes.
 * @param value The string.
 * @return Whether or not the string is a hex string.
 */
export const isHexStringIgnorePrefix = (value: string): boolean => {
  if (!value) return false;
  const trimmedValue = value.trim();
  const updatedValue = addHexPrefix(trimmedValue);
  return isHexString(updatedValue);
};

/**
 * @desc Adds an "0x" prefix to a string if one is not present.
 * @param value The starting string.
 * @return The prefixed string.
 */
export const addHexPrefix = (value: string): `0x${string}` =>
  startsWith(value, '0x') ? (value as `0x${string}`) : `0x${value}`;

export const convertStringToHex = (
  stringToConvert: BigNumberish | bigint | EthersBigNumber | Bytes,
): string => {
  if (typeof stringToConvert === 'bigint') {
    return stringToConvert.toString(16);
  }
  if (EthersBigNumber.isBigNumber(stringToConvert)) {
    return stringToConvert.toHexString();
  }
  if (isBytes(stringToConvert)) {
    return EthersBigNumber.from(stringToConvert).toHexString();
  }
  return new BigNumber(stringToConvert).toString(16);
};

export const toHex = (
  stringToConvert: BigNumberish | bigint | EthersBigNumber | Bytes,
): `0x${string}` => addHexPrefix(convertStringToHex(stringToConvert));

export const toHexOrUndefined = <
  T extends BigNumberish | bigint | EthersBigNumber | Bytes | undefined,
>(
  stringToConvert: T,
): T extends undefined ? undefined : `0x${string}` => {
  if (stringToConvert === undefined)
    return undefined as T extends undefined ? undefined : `0x${string}`;
  return toHex(stringToConvert) as T extends undefined
    ? undefined
    : `0x${string}`;
};

export const toHexNoLeadingZeros = (value: string): string =>
  toHex(value).replace(/^0x0*/, '0x');
