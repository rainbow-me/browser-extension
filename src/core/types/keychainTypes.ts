export enum KeychainType {
  HdKeychain = 'HdKeychain',
  KeyPairKeychain = 'KeyPairKeychain',
  ReadOnlyKeychain = 'ReadOnlyKeychain',
}

export type KeychainWallet = {
  type: KeychainType;
  accounts: `0x${string}`[];
  imported: boolean;
};
