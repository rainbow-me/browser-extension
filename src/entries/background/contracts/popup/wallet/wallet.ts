import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';
import { KeychainType } from '~/core/types/keychainTypes';

export enum KeychainWalletError {
  KEYCHAIN_NOT_INITIALIZED = 'KEYCHAIN_NOT_INITIALIZED',
  KEYCHAIN_LOCKED = 'KEYCHAIN_LOCKED',
  KEYCHAIN_NOT_FOUND = 'KEYCHAIN_NOT_FOUND',
}

export const keychainWalletErrors = {
  [KeychainWalletError.KEYCHAIN_NOT_INITIALIZED]: {},
  [KeychainWalletError.KEYCHAIN_LOCKED]: {},
  [KeychainWalletError.KEYCHAIN_NOT_FOUND]: {},
} as const;

// More typesafe KeychainWallet schema using KeychainType enum
export const keychainWalletSchema = z.object({
  type: z.enum(KeychainType),
  accounts: z.array(addressSchema),
  imported: z.boolean(),
  vendor: z.enum(['Ledger', 'Trezor']).optional(),
});

export const walletContract = oc
  .input(addressSchema)
  .errors(keychainWalletErrors)
  .output(keychainWalletSchema);
