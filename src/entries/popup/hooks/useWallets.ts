import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address } from 'viem';

import { useSettingsStore } from '~/core/state/currentSettings/store';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
  vendor: string | undefined;
}

const fetchWallets = async () => {
  const wallets = await getWallets();
  return wallets.reduce(
    (accounts, wallet) => [
      ...accounts,
      ...wallet.accounts.map((address) => ({
        address,
        type: wallet.type,
        vendor: wallet.vendor,
      })),
    ],
    [] as AddressAndType[],
  );
};

export const useWallets = () => {
  const { hiddenWallets } = useHiddenWalletsStore();

  const { data: allWallets, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchWallets,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [address] = useSettingsStore('currentAddress');

  return useMemo(() => {
    if (!allWallets)
      return {
        allWallets: [],
        visibleWallets: [],
        visibleOwnedWallets: [],
        watchedWallets: [],
        walletsReady: false,
        isWatchingWallet: false,
        fetchWallets: refetch,
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
      fetchWallets: refetch,
    };
  }, [allWallets, hiddenWallets, address, refetch]);
};
