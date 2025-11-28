import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export enum ImportWalletError {
  DUPLICATE_ACCOUNT = 'DUPLICATE_ACCOUNT',
}

export const importWalletErrors = {
  [ImportWalletError.DUPLICATE_ACCOUNT]: {
    data: z.object({ address: addressSchema }),
  },
} as const;

export const importContract = oc
  .input(z.object({ seed: z.string() }))
  .errors(importWalletErrors)
  .output(z.object({ address: addressSchema }));
