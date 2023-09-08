import { useEffect } from 'react';

import { useWalletBackUpsStore } from '~/core/state/walletBackUps';

import { useWalletsFromKeychain } from './useWalletsFromKeychain';

export const useWalletBackUps = () => {
  const { walletBackUps, setWalletBackedUp, isWalletBackedUp } =
    useWalletBackUpsStore();
  const { walletsFromKeychain } = useWalletsFromKeychain();
  useEffect(() => {
    console.log('walletBackUps', walletBackUps);
    // if there's no backup info we set everything as backed up for old users
    if (Object.keys(walletBackUps).length === 0) {
      console.log('BACKUPS INITL');
      walletsFromKeychain.map((wallet) => setWalletBackedUp({ wallet }));
    }
    // clear();
  }, [setWalletBackedUp, walletBackUps, walletsFromKeychain]);

  return { walletBackUps, isWalletBackedUp };
};
