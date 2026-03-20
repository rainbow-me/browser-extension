import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { hexSchema } from '~/core/schemas/hex';

const sendCallsCallSchema = z.object({
  to: addressSchema.optional(),
  data: hexSchema.optional(),
  value: hexSchema.optional(),
});

const sendCallsParamsSchema = z.object({
  version: z.string(),
  chainId: hexSchema,
  from: hexSchema.optional(),
  calls: z.array(sendCallsCallSchema).readonly(),
  id: z.string().optional(),
  atomicRequired: z.boolean().default(false),
});

const executeSendCallsBatchInputSchema = z.object({
  sendParams: sendCallsParamsSchema,
  sender: addressSchema,
  app: z.string(),
});

const executeSendCallsBatchOutputSchema = z.object({
  nonces: z.array(z.number()),
});

export const executeSendCallsBatchContract = oc
  .input(executeSendCallsBatchInputSchema)
  .output(executeSendCallsBatchOutputSchema);
