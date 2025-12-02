import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { hexSchema } from '~/core/schemas/hex';
import { personalSignMessageSchema } from '~/core/schemas/messageSigning';

export const personalSignContract = oc
  .input(
    z.object({
      address: addressSchema,
      message: personalSignMessageSchema,
    }),
  )
  .output(hexSchema);
