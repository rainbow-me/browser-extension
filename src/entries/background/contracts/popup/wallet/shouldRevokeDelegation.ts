import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

const shouldRevokeDelegationRequestSchema = z.object({
  userAddress: addressSchema,
});

const revokeSchema = z.object({
  address: addressSchema,
  chainId: z.number(),
});

const shouldRevokeDelegationResponseSchema = z.object({
  shouldRevoke: z.boolean(),
  revokes: z.array(revokeSchema),
});

export const shouldRevokeDelegationContract = oc
  .input(shouldRevokeDelegationRequestSchema)
  .output(shouldRevokeDelegationResponseSchema);
