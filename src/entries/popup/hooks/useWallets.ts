import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, useAccount } from 'wagmi';

import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
}

const fetchWallets = async () => {
  const wallets = await getWallets();
  return wallets.reduce(
    (accounts, wallet) => [
      ...accounts,
      ...wallet.accounts.map((address) => ({ address, type: wallet.type })),
    ],
    [] as AddressAndType[],
  );
};

export const useWallets = () => {
  const { hiddenWallets } = useHiddenWalletsStore();

  const { data: allWallets } = useQuery(['accounts'], fetchWallets, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { address } = useAccount();

  return useMemo(() => {
    if (!allWallets)
      return {
        allWallets: [],
        visibleWallets: [],
        visibleOwnedWallets: [],
        watchedWallets: [],
        walletsReady: false,
        isWatchingWallet: false,
      };

    const visibleWallets = allWallets.filter((a) => !hiddenWallets[a.address]);
    const visibleOwnedWallets = visibleWallets.filter(
      (a) => a.type !== KeychainType.ReadOnlyKeychain,
    );
    const watchedWallets = visibleWallets.filter(
      (a) => a.type === KeychainType.ReadOnlyKeychain,
    );
    const watchedAddresses = watchedWallets.map(({ address }) => address);
    return {
      allWallets,
      visibleWallets,
      visibleOwnedWallets,
      watchedWallets,
      walletsReady: true,
      isWatchingWallet: address && watchedAddresses.includes(address),
    };
  }, [allWallets, hiddenWallets, address]);
};
