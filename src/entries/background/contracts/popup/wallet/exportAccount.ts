import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const exportAccountContract = oc
  .input(
    z.object({
      address: addressSchema,
      password: z.string(),
    }),
  )
  .output(z.string());
