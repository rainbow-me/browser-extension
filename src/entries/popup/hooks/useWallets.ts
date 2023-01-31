import { useEffect, useState } from 'react';
import { Address } from 'wagmi';

import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
}

export const useWallets = () => {
  const [visibleWallets, setVisibleWallets] = useState<AddressAndType[]>([]);
  const [allWallets, setAllWallets] = useState<AddressAndType[]>([]);
  const { hiddenWallets } = useHiddenWalletsStore();

  const fetchWallets = async () => {
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
  };
  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    const vWallets = allWallets.filter(
      (wallet) => !hiddenWallets[wallet.address],
    );
    setVisibleWallets(vWallets);
  }, [allWallets, hiddenWallets]);

  return {
    allWallets,
    visibleWallets,
    fetchWallets,
  };
};
