import { Address, isAddress } from 'viem';
import z from 'zod';

export const addressSchema = z.custom<Address>(
  (val): val is Address =>
    typeof val === 'string' && isAddress(val, { strict: false }),
  { message: 'Invalid address' },
);

export function requireAddress(value: unknown, fieldName: string): Address {
  const result = addressSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid address for ${fieldName}: ${value}`);
  }
  return result.data;
}
