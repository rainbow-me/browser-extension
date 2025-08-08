import { ByteArray, isBytes } from 'viem';
import { z } from 'zod';

export const bytesSchema = z.custom<ByteArray>(isBytes, {
  message: 'Expected Uint8Array',
});
