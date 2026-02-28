import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { hexSchema } from '~/core/schemas/hex';
import {
  personalSignMessageSchema,
  typedDataMessageSchema,
} from '~/core/schemas/messageSigning';

// Transaction request schema (simplified from ethers TransactionRequest)
const transactionRequestSchema = z.object({
  to: z.string().optional(),
  from: z.string().optional(),
  nonce: z.number().optional(),
  gasLimit: z.any().optional(),
  gasPrice: z.any().optional(),
  data: z.string().optional(),
  value: z.any().optional(),
  chainId: z.number().optional(),
  type: z.number().optional(),
  maxFeePerGas: z.any().optional(),
  maxPriorityFeePerGas: z.any().optional(),
});

const hwVendorSchema = z.enum(['Ledger', 'Trezor']);

// Pending HW request schema
const pendingHWRequestSchema = z.discriminatedUnion('action', [
  z.object({
    id: z.number(),
    action: z.literal('signTransaction'),
    vendor: hwVendorSchema,
    payload: transactionRequestSchema,
  }),
  z.object({
    id: z.number(),
    action: z.literal('signMessage'),
    vendor: hwVendorSchema,
    payload: z.object({
      message: personalSignMessageSchema,
      address: addressSchema,
    }),
  }),
  z.object({
    id: z.number(),
    action: z.literal('signTypedData'),
    vendor: hwVendorSchema,
    payload: z.object({
      message: typedDataMessageSchema,
      address: addressSchema,
    }),
  }),
]);

// Get pending HW requests
export const getPendingHWRequestsContract = oc.output(
  z.array(pendingHWRequestSchema),
);

// Respond to an HW request
export const respondToHWRequestContract = oc
  .input(
    z.object({
      id: z.number(),
      response: z.union([hexSchema, z.object({ error: z.string() })]),
    }),
  )
  .output(z.void());

export const hwContract = {
  getPendingHWRequests: getPendingHWRequestsContract,
  respondToHWRequest: respondToHWRequestContract,
};
