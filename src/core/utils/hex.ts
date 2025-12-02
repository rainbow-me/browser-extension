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
  if (
    EthersBigNumber.isBigNumber(stringToConvert) &&
    'toHexString' in stringToConvert // make sure to only match EthersBigNumber
  ) {
    return stringToConvert.toHexString();
  }
  if (isBytes(stringToConvert)) {
    return EthersBigNumber.from(stringToConvert).toHexString();
  }
  const bn = new BigNumber(stringToConvert);
  if (bn.isNaN()) {
    throw new Error(`Invalid BigNumberish ${stringToConvert}`);
  }
  return bn.toString(16);
};

export const toHex = (
  stringToConvert: BigNumberish | bigint | EthersBigNumber | Bytes,
): `0x${string}` => addHexPrefix(convertStringToHex(stringToConvert));

export const toHexOrUndefined = <
  T extends BigNumberish | bigint | EthersBigNumber | Bytes | undefined | null,
>(
  stringToConvert: T,
): T extends undefined | null ? undefined : `0x${string}` => {
  if (stringToConvert === undefined || stringToConvert === null)
    return undefined as T extends undefined | null ? undefined : `0x${string}`;
  return toHex(stringToConvert) as T extends undefined | null
    ? undefined
    : `0x${string}`;
};

export const toHexNoLeadingZeros = (value: string): string =>
  toHex(value).replace(/^0x0*/, '0x');

/**
 * @desc Joins signature components (r, s, v) into a single hex signature.
 * Handles v values that can be either string or number, and strips 0x prefixes.
 * @param signature The signature components from hardware wallet APIs
 * @returns A concatenated signature hex string (0x + r + s + v)
 * @throws Error if signature components are invalid
 */
const isValidHex = (value: string): boolean => /^[0-9a-fA-F]*$/.test(value);

export const joinSignature = (signature: {
  r: string;
  s: string;
  v: string | number;
}): `0x${string}` => {
  if (!signature.r || !signature.s) {
    throw new Error('Invalid signature: r and s are required');
  }

  const r = signature.r.startsWith('0x') ? signature.r.slice(2) : signature.r;
  const s = signature.s.startsWith('0x') ? signature.s.slice(2) : signature.s;

  if (!isValidHex(r) || !isValidHex(s)) {
    throw new Error('Invalid signature: r and s must be valid hex strings');
  }

  if (r.length !== 64 || s.length !== 64) {
    throw new Error('Invalid signature: r and s must be 32 bytes');
  }

  const vValue = signature.v;
  const vHex =
    typeof vValue === 'string'
      ? vValue.startsWith('0x')
        ? vValue.slice(2)
        : vValue
      : vValue.toString(16);

  if (!isValidHex(vHex)) {
    throw new Error('Invalid signature: v must be a valid hex string');
  }

  return `0x${r}${s}${vHex.padStart(2, '0')}`;
};
