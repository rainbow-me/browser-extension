import { useEffect, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import {
  useWalletBackUpsStore,
  useWalletBackupReminderStore,
} from '~/core/state/walletBackUps';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useWalletsFromKeychain } from './useWalletsFromKeychain';

export const useWalletBackUps = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { reminded, setReminded } = useWalletBackupReminderStore();
  const [showWalletBackup, setShowWalletBackup] = useState(false);
  const {
    walletBackUps,
    setWalletBackedUp,
    setWalletAlreadyBackedUp,
    isWalletBackedUp,
    getWalletBackUp,
    // clear,
  } = useWalletBackUpsStore();
  const { walletsFromKeychain } = useWalletsFromKeychain();
  useEffect(() => {
    // if there's no backup info we set everything as backed up for old users
    if (Object.keys(walletBackUps).length === 0) {
      walletsFromKeychain.map((wallet) => setWalletAlreadyBackedUp({ wallet }));
    }
    // clear();
  }, [
    setWalletAlreadyBackedUp,
    setWalletBackedUp,
    walletBackUps,
    walletsFromKeychain,
  ]);

  useEffect(() => {
    if (!reminded) {
      const wallet = walletsFromKeychain.find(
        (wallet) =>
          !!wallet.accounts.find((account) =>
            isLowerCaseMatch(account, currentAddress),
          ),
      );
      if (wallet) {
        const walletBackup = getWalletBackUp({ wallet });
        if (!walletBackup) {
          setShowWalletBackup(true);
          setReminded();
        }
      }
    }
  }, [
    currentAddress,
    getWalletBackUp,
    reminded,
    setReminded,
    setWalletBackedUp,
    walletBackUps,
    walletsFromKeychain,
  ]);

  return {
    walletBackUps,
    showWalletBackup,
    isWalletBackedUp,
    setShowWalletBackup,
  };
};
