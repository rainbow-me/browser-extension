import { useCallback, useEffect, useState } from 'react';

import {
  useWalletBackupReminderStore,
  useWalletBackupsStore,
} from '~/core/state/walletBackups';

import { useHomePromptQueue } from './useHomePromptsQueue';
import { useWalletsFromKeychain } from './useWalletsFromKeychain';

export const useWalletBackups = () => {
  const { reminded, setReminded } = useWalletBackupReminderStore();
  const [showWalletBackupReminder, setShowWalletBackupReminder] =
    useState(false);
  const { popQueue } = useHomePromptQueue();
  const {
    needsInitialization,
    walletBackups,
    setWalletBackedUp,
    setWalletAlreadyBackedUp,
    setNeedsInitialization,
    isWalletBackedUp,
    getWalletBackup,
  } = useWalletBackupsStore();

  const { walletsFromKeychain } = useWalletsFromKeychain();

  const closeBackupReminder = useCallback(() => {
    popQueue();
    setShowWalletBackupReminder(false);
  }, [popQueue, setShowWalletBackupReminder]);

  useEffect(() => {
    // if there's no backup info we set everything as backed up for old users
    if (
      needsInitialization &&
      walletsFromKeychain.length &&
      Object.keys(walletBackups).length === 0
    ) {
      walletsFromKeychain.map((wallet) => setWalletAlreadyBackedUp({ wallet }));
      setNeedsInitialization(false);
    }
  }, [
    needsInitialization,
    setNeedsInitialization,
    setWalletAlreadyBackedUp,
    setWalletBackedUp,
    walletBackups,
    walletsFromKeychain,
  ]);

  useEffect(() => {
    if (!reminded && walletsFromKeychain.length) {
      const needsBackupReminder = walletsFromKeychain.find((wallet) => {
        const walletBackup = getWalletBackup({ wallet });
        return !walletBackup?.backedUp;
      });
      if (needsBackupReminder) {
        setShowWalletBackupReminder(true);
      } else {
        popQueue();
      }
      setReminded();
    }
  }, [
    getWalletBackup,
    popQueue,
    reminded,
    setReminded,
    setShowWalletBackupReminder,
    walletsFromKeychain,
  ]);

  return {
    walletBackups,
    showWalletBackupReminder,
    isWalletBackedUp,
    closeBackupReminder,
  };
};
