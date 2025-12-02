import { TypedDataDefinition, validateTypedData } from 'viem';
import { z } from 'zod';

// Schema for PersonalSignMessage
export const personalSignMessageSchema = z.object({
  type: z.literal('personal_sign'),
  message: z.string(),
});

// Schema for TypedDataMessage - using z.any() for TypedDataDefinition as it's complex
// The actual validation happens in the handler using viem's validateTypedData
export const typedDataMessageSchema = z.object({
  type: z.literal('sign_typed_data'),
  data: z.custom<TypedDataDefinition>(
    (val): val is TypedDataDefinition => {
      try {
        validateTypedData(val as Parameters<typeof validateTypedData>[0]);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid typed data' },
  ),
});

// Schema for SigningMessage (union of both)
export const signingMessageSchema = z.discriminatedUnion('type', [
  personalSignMessageSchema,
  typedDataMessageSchema,
]);
