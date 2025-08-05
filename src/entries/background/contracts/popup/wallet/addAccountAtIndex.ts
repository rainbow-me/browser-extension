import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const addAccountAtIndexContract = oc
  .input(
    z.object({
      siblingAddress: addressSchema,
      index: z.number(),
      address: addressSchema,
    }),
  )
  .output(addressSchema);
