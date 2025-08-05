import { Address, isAddress } from 'viem';
import z from 'zod';

export const addressSchema = z.custom<Address>(
  (val): val is Address => typeof val === 'string' && isAddress(val),
  { message: 'Invalid address' },
);
