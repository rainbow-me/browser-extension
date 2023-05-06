import { useQuery } from '@tanstack/react-query';
import { Address, useAccount } from 'wagmi';

import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { KeychainType } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
}

export const useWallets = () => {
  const { hiddenWallets } = useHiddenWalletsStore();

  const { address } = useAccount();

  const { data } = useQuery(['wallets'], getWallets, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: [],
    initialDataUpdatedAt: 0,
    select(wallets) {
      const allAccounts = wallets.reduce(
        (accounts, wallet) => [
          ...accounts,
          ...wallet.accounts.map((address) => ({
            address,
            type: wallet.type,
          })),
        ],
        [] as AddressAndType[],
      );

      const visibleWallets = allAccounts.filter(
        (a) => !hiddenWallets[a.address],
      );
      const visibleOwnedWallets = visibleWallets.filter(
        (a) => a.type !== KeychainType.ReadOnlyKeychain,
      );
      const watchedWallets = visibleWallets.filter(
        (a) => a.type === KeychainType.ReadOnlyKeychain,
      );

      return {
        allAccounts,
        allWallets: wallets,
        visibleWallets,
        visibleOwnedWallets,
        watchedWallets,
        isWatchingAccount:
          !!address && watchedWallets.some(({ address }) => address),
      };
    },
  });

  return data;
};
