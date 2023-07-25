/* eslint-disable @typescript-eslint/no-empty-interface */
// these are all reported seperately so they must be optional
export interface UserProperties {
  hotWallets?: number;
  hardwareWallets?: number;
  watchedWallets?: number;
  recoveryPhrases?: number;
  privateKeys?: number;
  trezorDevices?: number;
  ledgerDevices?: number;
}
