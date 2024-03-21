import { KeychainType } from '~/core/types/keychainTypes';
import { getStatus, getWallets } from '~/entries/popup/handlers/wallet';

import { analytics } from '..';

export const identifyWalletTypes = async () => {
  const { unlocked, ready } = await getStatus();
  if (!unlocked || !ready) return;

  const wallets = await getWallets();

  const identify = wallets.reduce(
    (result, wallet) => {
      switch (wallet.type) {
        case KeychainType.HdKeychain:
          result.ownedAccounts += wallet.accounts.length;
          result.recoveryPhrases += 1;
          if (wallet.imported) {
            result.importedRecoveryPhrases += 1;
            result.hasImported = true;
          }
          break;
        case KeychainType.KeyPairKeychain:
          result.ownedAccounts += wallet.accounts.length;
          result.privateKeys += 1;
          if (wallet.imported) {
            result.importedPrivateKeys += 1;
            result.hasImported = true;
          }
          break;
        case KeychainType.ReadOnlyKeychain:
          result.watchedAccounts += wallet.accounts.length;
          break;
        case KeychainType.HardwareWalletKeychain:
          result.hardwareAccounts += wallet.accounts.length;
          if (wallet.vendor === 'Ledger') {
            result.ledgerDevices += 1;
          } else if (wallet.vendor === 'Trezor') {
            result.trezorDevices += 1;
          } else if (wallet.vendor === 'GridPlus') {
            result.gridPlusDevices += 1;
          }
          break;
      }
      return result;
    },
    {
      ownedAccounts: 0,
      watchedAccounts: 0,
      recoveryPhrases: 0,
      importedRecoveryPhrases: 0,
      privateKeys: 0,
      importedPrivateKeys: 0,
      hasImported: false,
      hardwareAccounts: 0,
      ledgerDevices: 0,
      trezorDevices: 0,
      gridPlusDevices: 0,
    },
  );

  analytics.identify({
    ownedAccounts: identify.ownedAccounts,
    hardwareAccounts: identify.hardwareAccounts,
    watchedAccounts: identify.watchedAccounts,
    recoveryPhrases: identify.recoveryPhrases,
    importedRecoveryPhrases: identify.importedRecoveryPhrases,
    privateKeys: identify.privateKeys,
    importedPrivateKeys: identify.importedPrivateKeys,
    ledgerDevices: identify.ledgerDevices,
    trezorDevices: identify.trezorDevices,
    hasImported: identify.hasImported,
  });
};
