import { Bytes, isBytes } from '@ethersproject/bytes';
import { z } from 'zod';

export const bytesSchema = z.custom<Bytes>(isBytes, {
  message: 'Expected ArrayLike<number>',
});
