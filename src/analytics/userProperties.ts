// these can be reported separately so they must be optional
export interface UserProperties {
  // number of imported or generated accounts
  ownedAccounts?: number;
  // number of accounts tied to paired hardware wallets
  hardwareAccounts?: number;
  // number of watched addresses or ens
  watchedAccounts?: number;
  // number of imported or generated secret recovery phrases
  recoveryPhrases?: number;
  // number of imported secret recovery phrases
  importedRecoveryPhrases?: number;
  // number of unique private keys
  privateKeys?: number;
  // number of imported unique private keys
  importedPrivateKeys?: number;
  // number of paired trezor hardware wallets
  trezorDevices?: number;
  // number of paired ledger hardware wallets
  ledgerDevices?: number;
  // whether a recovery phrase or private key has been imported
  hasImported?: boolean;
  unclaimedBalance?: string;
  unclaimedBalanceUSD?: string;
  claimedBalance?: string;
  claimedBalanceUSD?: string;
}
