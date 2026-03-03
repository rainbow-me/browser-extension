import { oc } from '@orpc/contract';
import z from 'zod';

import { RapSwapActionParameters } from '~/core/raps/references';
import { addressSchema } from '~/core/schemas/address';

// Zod schema for TypedDataMessage - matches the TypeScript type
const typedDataMessageSchema = z.object({
  type: z.literal('sign_typed_data'),
  data: z.unknown(), // TypedDataDefinition - using unknown for flexibility
});

// Zod schema for Hex string (0x...)
const hexSchema = z.string().regex(/^0x[0-9a-fA-F]*$/);

// Zod schema for ExecuteRapResponse output - matches what walletExecuteRap returns
const executeRapResponseSchema = z.object({
  nonce: z.number().optional(),
  errorMessage: z.string().nullable().optional(),
  hash: z.string().nullable().optional(),
});

// Input schema for sign_typed_data action
export const SignTypedDataInputSchema = z.object({
  address: addressSchema,
  message: typedDataMessageSchema,
});

// Input schema for execute_rap action
export const ExecuteRapInputSchema = z.object({
  rapActionParameters:
    z.custom<RapSwapActionParameters<'swap' | 'crosschainSwap'>>(),
  type: z.enum(['swap', 'crosschainSwap']),
});

// Input schema for wallet actions
export const WalletActionInputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('sign_typed_data'),
    payload: SignTypedDataInputSchema,
  }),
  z.object({
    action: z.literal('execute_rap'),
    payload: ExecuteRapInputSchema,
  }),
]);

// Output schema for wallet actions
export const WalletActionOutputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('sign_typed_data'),
    result: hexSchema,
  }),
  z.object({
    action: z.literal('execute_rap'),
    result: executeRapResponseSchema,
  }),
]);

// Contract for wallet actions
export const walletActionContract = oc
  .input(WalletActionInputSchema)
  .output(WalletActionOutputSchema);
