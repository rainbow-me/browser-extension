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
 * Error thrown when attempting to import a duplicate account
 */
export class DuplicateAccountError extends Error {
  readonly account: Address;

  constructor(account: Address, message?: string) {
    super(message || `Duplicate account ${account}`);
    this.name = 'DuplicateAccountError';
    this.account = account;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateAccountError);
    }
  }
}
