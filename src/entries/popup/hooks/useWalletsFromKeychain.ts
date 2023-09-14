import { useEffect, useState } from 'react';

import { KeychainWallet } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export const useWalletsFromKeychain = () => {
  const [walletsFromKeychain, setWalletsFromKeychain] = useState<
    KeychainWallet[]
  >([]);
  useEffect(() => {
    const fetchWallets = async () => {
      const walletsFromKeychain = await getWallets();
      setWalletsFromKeychain(walletsFromKeychain);
    };
    fetchWallets();
  }, []);
  return { walletsFromKeychain };
};
