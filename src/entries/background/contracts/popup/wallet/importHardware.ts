import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const importHardwareContract = oc
  .input(
    z.object({
      vendor: z.enum(['Ledger', 'Trezor']),
      deviceId: z.string(),
      wallets: z.array(
        z.object({
          address: addressSchema,
          index: z.number(),
          hdPath: z.string().optional(),
        }),
      ),
      accountsEnabled: z.number(),
    }),
  )
  .output(z.object({ address: addressSchema }));
