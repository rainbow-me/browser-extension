import { Address, Hex, getAddress, isHex } from 'viem';

import { RainbowError } from '~/logger';

export function requireAddress(
  value: string | undefined,
  fieldName: string,
): Address {
  if (!value) {
    throw new RainbowError(`[raps/validation]: Missing ${fieldName}`);
  }
  try {
    return getAddress(value);
  } catch {
    throw new RainbowError(`[raps/validation]: Invalid ${fieldName}`);
  }
}

export function requireHex(value: string | undefined, fieldName: string): Hex {
  if (value && isHex(value)) return value as Hex;
  throw new RainbowError(`[raps/validation]: Invalid ${fieldName}`);
}

export function getQuoteAllowanceTargetAddress(quote: {
  allowanceTarget?: string;
}): Address {
  return requireAddress(quote.allowanceTarget, 'quote.allowanceTarget');
}
