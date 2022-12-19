import { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { getWallets } from '~/core/keychain';
import { KeychainType } from '~/core/types/keychainTypes';

type Wallet = {
  type: KeychainType;
  accounts: Address[];
  imported: boolean;
};

export function useBackgroundWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    const get = async () => {
      const wallets = await getWallets();
      setWallets(wallets);
    };
    get();
  }, [setWallets]);

  return { wallets };
}
