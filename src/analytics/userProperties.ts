// these can be reported separately so they must be optional
export interface UserProperties {
  ownedAccounts?: number;
  hardwareAccounts?: number;
  watchedAccounts?: number;
  recoveryPhrases?: number;
  importedRecoveryPhrases?: number;
  privateKeys?: number;
  importedPrivateKeys?: number;
  trezorDevices?: number;
  ledgerDevices?: number;
  hasImported?: boolean;
  unclaimedBalance?: string;
  unclaimedBalanceUSD?: string;
  claimedBalance?: string;
  claimedBalanceUSD?: string;
}
