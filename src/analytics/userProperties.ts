/* eslint-disable @typescript-eslint/no-empty-interface */

// these are all reported seperately so they must be optional
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
}
