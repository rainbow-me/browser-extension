import { Hex, isHex } from 'viem';
import z from 'zod';

export const hexSchema = z.custom<Hex>(
  (val): val is Hex => typeof val === 'string' && isHex(val),
  { message: 'Invalid hex' },
);
