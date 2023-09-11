import { useEffect, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useWalletBackUpsStore } from '~/core/state/walletBackUps';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useWalletsFromKeychain } from './useWalletsFromKeychain';

export const useWalletBackUps = () => {
  const { currentAddress } = useCurrentAddressStore();
  const [showWalletBackup, setShowWalletBackup] = useState(false);
  const {
    walletBackUps,
    setWalletBackedUp,
    isWalletBackedUp,
    getWalletBackUp,
    // clear,
  } = useWalletBackUpsStore();
  const { walletsFromKeychain } = useWalletsFromKeychain();
  useEffect(() => {
    console.log('walletBackUps', walletBackUps);
    // if there's no backup info we set everything as backed up for old users
    // if (Object.keys(walletBackUps).length === 0) {
    //   console.log('BACKUPS INITL');
    //   walletsFromKeychain.map((wallet) => setWalletBackedUp({ wallet }));
    // }
    // clear();
  }, [setWalletBackedUp, walletBackUps, walletsFromKeychain]);

  useEffect(() => {
    const wallet = walletsFromKeychain.find((wallet) => {
      return !!wallet.accounts.find((account) =>
        isLowerCaseMatch(account, currentAddress),
      );
    });
    if (wallet) {
      const walletBackup = getWalletBackUp({ wallet });
      if (!walletBackup) {
        setShowWalletBackup(true);
      }
    }
  }, [
    currentAddress,
    getWalletBackUp,
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
