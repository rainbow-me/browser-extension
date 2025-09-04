import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const deriveAccountsFromSecretContract = oc
  .input(z.object({ secret: z.string() }))
  .output(z.object({ accounts: z.array(addressSchema) }));
