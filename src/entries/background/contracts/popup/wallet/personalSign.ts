import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { bytesSchema } from '~/core/schemas/bytes';

export const personalSignContract = oc
  .input(
    z.object({
      address: addressSchema,
      msgData: z.union([z.string(), bytesSchema]),
    }),
  )
  .output(z.string());
