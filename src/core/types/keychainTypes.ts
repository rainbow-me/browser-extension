import { Address } from 'viem';

export enum KeychainType {
  HdKeychain = 'HdKeychain',
  KeyPairKeychain = 'KeyPairKeychain',
  ReadOnlyKeychain = 'ReadOnlyKeychain',
  HardwareWalletKeychain = 'HardwareWalletKeychain',
}

export type KeychainWallet = {
  type: KeychainType;
  accounts: `0x${string}`[];
  imported: boolean;
  vendor?: 'Ledger' | 'Trezor';
};

/**
 * Thrown when attempting to import an account that already exists in the vault.
 */
export class DuplicateAccountError extends Error {
  readonly account: Address;

  constructor(account: Address, message?: string) {
    super(message || `Duplicate account ${account}`);
    this.name = 'DuplicateAccountError';
    this.account = account;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateAccountError);
    }
  }
}
