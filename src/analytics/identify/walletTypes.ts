import { KeychainType } from '~/core/types/keychainTypes';
import { getStatus, getWallets } from '~/entries/popup/handlers/wallet';

import { analytics } from '..';

export const identifyWalletTypes = async () => {
  const { unlocked, ready } = await getStatus();
  if (!unlocked || !ready) return;

  const wallets = await getWallets();

  const ownedAccounts = wallets
    .filter(
      (a) =>
        a.type === KeychainType.HdKeychain ||
        a.type === KeychainType.KeyPairKeychain,
    )
    .reduce((count, wallet) => count + wallet.accounts.length, 0);

  const watchedAccounts = wallets
    .filter((a) => a.type === KeychainType.ReadOnlyKeychain)
    .reduce((count, wallet) => count + wallet.accounts.length, 0);

  const recoveryPhrases = wallets.filter(
    (a) => a.type === KeychainType.HdKeychain,
  ).length;

  const importedRecoveryPhrases = wallets.filter(
    (a) => a.type === KeychainType.HdKeychain && !a.imported,
  ).length;

  const privateKeys = wallets.filter(
    (a) => a.type === KeychainType.KeyPairKeychain,
  ).length;

  const importedPrivateKeys = wallets.filter(
    (a) => a.type === KeychainType.KeyPairKeychain && !a.imported,
  ).length;

  const hasImported = importedPrivateKeys > 0 || importedRecoveryPhrases > 0;

  const hardwareWallets = wallets.filter(
    (a) => a.type === KeychainType.HardwareWalletKeychain,
  );

  const hardwareAccounts = hardwareWallets.reduce(
    (count, wallet) => count + wallet.accounts.length,
    0,
  );

  const ledgerDevices = wallets.filter((a) => a.vendor === 'Ledger').length;

  const trezorDevices = wallets.filter((a) => a.vendor === 'Trezor').length;

  analytics.identify({
    ownedAccounts,
    hardwareAccounts,
    watchedAccounts,
    recoveryPhrases,
    importedRecoveryPhrases,
    privateKeys,
    importedPrivateKeys,
    ledgerDevices,
    trezorDevices,
    hasImported,
  });
};
