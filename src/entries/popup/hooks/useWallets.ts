import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
}

export const useWallets = () => {
  const [allWallets, setAllWallets] = useState<AddressAndType[]>([]);
  const { hiddenWallets } = useHiddenWalletsStore();

  const { visibleWallets, visibleOwnedWallets, watchedWallets } =
    useMemo(() => {
      const visibleWallets: AddressAndType[] = [];
      const visibleOwnedWallets: AddressAndType[] = [];
      const watchedWallets: AddressAndType[] = [];
      allWallets.forEach((wallet) => {
        if (!hiddenWallets[wallet.address]) {
          visibleWallets.push(wallet);
          if (wallet.type !== KeychainType.ReadOnlyKeychain) {
            visibleOwnedWallets.push(wallet);
          } else if (wallet.type === KeychainType.ReadOnlyKeychain) {
            watchedWallets.push(wallet);
          }
        }
      });
      return { visibleWallets, visibleOwnedWallets, watchedWallets };
    }, [allWallets, hiddenWallets]);

  const fetchWallets = useCallback(async () => {
    const wallets = await getWallets();
    let accounts: AddressAndType[] = [];
    wallets.forEach((wallet) => {
      accounts = [
        ...accounts,
        ...wallet.accounts.map(
          (account): AddressAndType => ({
            address: account,
            type: wallet.type,
          }),
        ),
      ];
    });
    setAllWallets(accounts);
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    allWallets,
    visibleWallets,
    visibleOwnedWallets,
    watchedWallets,
    fetchWallets,
  };
};
