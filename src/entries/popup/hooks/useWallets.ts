import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { queryClient } from '~/core/react-query';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';

import { getWallets } from '../handlers/wallet';

export interface AddressAndType {
  address: Address;
  type: KeychainType;
  vendor: string | undefined;
}

const walletsQueryKey = ['wallets'];

export const refetchWallets = () =>
  queryClient.refetchQueries({
    queryKey: walletsQueryKey,
    exact: true,
  });

const noop = (w: unknown) => w;
export const useWallets = <TSelect = KeychainWallet[]>(
  select: (wallets: KeychainWallet[]) => TSelect = noop as () => TSelect,
) => {
  const { data } = useQuery(walletsQueryKey, getWallets, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    initialData: [],
    initialDataUpdatedAt: 0,
    select,
  });

  return data;
};
