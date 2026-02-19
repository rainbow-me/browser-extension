import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { hexSchema } from '~/core/schemas/hex';

const revokeDelegationRequestSchema = z.object({
  chainId: z.number(),
  userAddress: addressSchema,
  transactionOptions: z.object({
    maxFeePerGas: hexSchema,
    maxPriorityFeePerGas: hexSchema,
    gasLimit: hexSchema,
  }),
});

const revokeDelegationResponseSchema = z.object({
  txHash: hexSchema.optional(),
  nonce: z.number().optional(),
  error: z.string().nullable(),
});

export const revokeDelegationContract = oc
  .input(revokeDelegationRequestSchema)
  .output(revokeDelegationResponseSchema);
