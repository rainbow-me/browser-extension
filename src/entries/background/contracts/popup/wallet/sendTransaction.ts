import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { hexSchema } from '~/core/schemas/hex';

const transactionRequestSchema = z.object({
  to: z.string().optional(),
  from: addressSchema.optional(),
  nonce: z.number().optional(),
  gasLimit: hexSchema.optional(),
  gasPrice: hexSchema.optional(),
  maxFeePerGas: hexSchema.optional(),
  maxPriorityFeePerGas: hexSchema.optional(),
  data: hexSchema.optional(),
  value: hexSchema.optional(),
  chainId: z.number().optional(),
  type: z.number().optional(),
});

const transactionResponseSchema = z.object({
  hash: hexSchema,
  to: addressSchema.optional(),
  from: addressSchema,
  nonce: z.number(),
  gasLimit: hexSchema,
  gasPrice: hexSchema.optional(),
  maxFeePerGas: hexSchema.optional(),
  maxPriorityFeePerGas: hexSchema.optional(),
  data: hexSchema,
  value: hexSchema,
  chainId: z.number(),
  confirmations: z.number(),
});

export const sendTransactionContract = oc
  .input(transactionRequestSchema)
  .output(transactionResponseSchema);
