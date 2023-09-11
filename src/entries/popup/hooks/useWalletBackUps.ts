import { useCallback, useEffect } from 'react';

import {
  useShowWalletBackupReminderStore,
  useWalletBackUpsStore,
  useWalletBackupReminderStore,
} from '~/core/state/walletBackUps';

import { useHomePromptQueue } from './useHomePromptsQueue';
import { useWalletsFromKeychain } from './useWalletsFromKeychain';

export const useWalletBackUps = () => {
  const { reminded, setReminded } = useWalletBackupReminderStore();
  const { show: showWalletBackupReminder, setShowWalletBackupReminder } =
    useShowWalletBackupReminderStore();
  const { popQueue } = useHomePromptQueue();
  const {
    walletBackUps,
    setWalletBackedUp,
    setWalletAlreadyBackedUp,
    isWalletBackedUp,
    getWalletBackUp,
    // clear,
  } = useWalletBackUpsStore();

  const { walletsFromKeychain } = useWalletsFromKeychain();

  const closeBackupReminder = useCallback(() => {
    popQueue();
    setShowWalletBackupReminder(false);
  }, [popQueue, setShowWalletBackupReminder]);

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
    if (!reminded && walletsFromKeychain.length) {
      const needsBackupReminder = walletsFromKeychain.find((wallet) => {
        const walletBackup = getWalletBackUp({ wallet });
        return !walletBackup?.backedUp;
      });
      if (needsBackupReminder) {
        setShowWalletBackupReminder(true);
        setReminded();
      } else {
        popQueue();
      }
    }
  }, [
    getWalletBackUp,
    popQueue,
    reminded,
    setReminded,
    setShowWalletBackupReminder,
    walletsFromKeychain,
  ]);

  return {
    walletBackUps,
    showWalletBackupReminder,
    isWalletBackedUp,
    closeBackupReminder,
  };
};
