import { type CrosschainQuote, type Quote } from '@rainbow-me/swaps';
import { type Address, type Hex, getAddress, isHex } from 'viem';

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
  if (value && isHex(value)) {
    return value;
  }

  throw new RainbowError(`[raps/validation]: Invalid ${fieldName}`);
}

export function getQuoteAllowanceTargetAddress(
  quote: Quote | CrosschainQuote,
): Address {
  return requireAddress(quote.allowanceTarget, 'quote.allowanceTarget');
}
