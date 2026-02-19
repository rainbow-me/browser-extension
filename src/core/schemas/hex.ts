import { Hex, isHex } from 'viem';
import z from 'zod';

export const hexSchema = z.custom<Hex>(
  (val): val is Hex => typeof val === 'string' && isHex(val),
  { message: 'Invalid hex' },
);

export function requireHex(value: unknown, fieldName: string): Hex {
  const result = hexSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid hex for ${fieldName}: ${value}`);
  }
  return result.data;
}
