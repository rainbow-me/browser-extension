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
