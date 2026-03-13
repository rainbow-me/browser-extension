import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { hexSchema } from '~/core/schemas/hex';

const sendCallsCallSchema = z.object({
  to: hexSchema.optional(),
  data: hexSchema.optional(),
  value: hexSchema.optional(),
});

const sendCallsParamsSchema = z.object({
  version: z.string(),
  chainId: hexSchema,
  from: hexSchema.optional(),
  calls: z.array(sendCallsCallSchema),
  id: hexSchema.optional(),
  atomicRequired: z.boolean().optional(),
});

const executeSendCallsBatchInputSchema = z.object({
  sendParams: sendCallsParamsSchema,
  sender: addressSchema,
  app: z.string(),
});

const executeSendCallsBatchOutputSchema = z.object({
  txHashes: z.array(hexSchema),
});

export const executeSendCallsBatchContract = oc
  .input(executeSendCallsBatchInputSchema)
  .output(executeSendCallsBatchOutputSchema);
