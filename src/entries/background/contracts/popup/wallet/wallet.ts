import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { KeychainType } from '~/core/types/keychainTypes';

// More typesafe KeychainWallet schema using KeychainType enum
export const keychainWalletSchema = z.object({
  type: z.enum(KeychainType),
  accounts: z.array(addressSchema),
  imported: z.boolean(),
  vendor: z.enum(['Ledger', 'Trezor']).optional(),
});

export const walletContract = oc
  .input(addressSchema)
  .output(keychainWalletSchema);
