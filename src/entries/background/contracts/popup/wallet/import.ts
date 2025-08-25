import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const importContract = oc
  .input(z.object({ seed: z.string() }))
  .output(z.object({ address: addressSchema }));
