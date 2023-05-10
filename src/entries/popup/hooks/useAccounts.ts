import {
  Address,
  FetchEnsNameArgs,
  FetchEnsNameResult,
  fetchEnsName,
} from '@wagmi/core';
import { partition } from 'lodash';
import { useCallback } from 'react';
import {
  useQuery as useWagmiQuery,
  useQueryClient as useWagmiQueryClient,
} from 'wagmi';

import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { useWalletOrderStore } from '~/core/state/walletOrder';
import { ChainId } from '~/core/types/chains';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';

import { AddressAndType, useWallets } from './useWallets';

export type Account = AddressAndType & {
  walletName?: string;
  ensName?: string | null;
};

// wagmi doesn't export it's query keys
// import { queryKey as wagmiEnsNameQueryKey } from 'wagmi/dist/declarations/src/hooks/ens/useEnsName';
const wagmiEnsNameQueryKey = ({
  address,
  chainId,
}: Partial<FetchEnsNameArgs>) => [
  {
    entity: 'ensName',
    address,
    chainId,
  },
];

const updateWagmiEnsNameCache = (
  wagmiQueryClient: ReturnType<typeof useWagmiQueryClient>,
  entries: { address: Address; ensName: FetchEnsNameResult }[],
  chainId: ChainId = ChainId.mainnet,
) => {
  entries.forEach(({ address, ensName }) => {
    wagmiQueryClient.setQueryData(
      wagmiEnsNameQueryKey({ chainId, address }),
      ensName,
    );
  });
};

const noop = (w: unknown) => w;
export const useAccounts = <TSelect = Account[]>(
  select: (wallets: Account[]) => TSelect = noop as () => TSelect,
) => {
  const { walletNames } = useWalletNamesStore();
  const { walletOrder } = useWalletOrderStore();
  const accounts = useWallets(
    useCallback<(wallets: KeychainWallet[]) => Account[]>(
      (wallets) => {
        const accounts = wallets.reduce(
          (accounts, wallet) => [
            ...accounts,
            ...wallet.accounts.map((address) => ({
              address,
              type: wallet.type,
              walletName: walletNames[address],
            })),
          ],
          [] as Account[],
        );

        if (!walletOrder.length) return accounts;

        return walletOrder
          .map((address) => accounts.find((a) => address === a.address))
          .filter(Boolean);
      },
      [walletNames, walletOrder],
    ),
  );

  const wagmiQueryClient = useWagmiQueryClient();
  const chainId = ChainId.mainnet;
  const { data: accountsWithEnsNames } = useWagmiQuery(
    [{ entity: 'ensNames', accounts, chainId }],
    async () => {
      const result = await Promise.all(
        accounts.map(async (account) => ({
          ...account,
          ensName: await fetchEnsName({ chainId, address: account.address }),
        })),
      );
      // update wagmi cache to already have it on useEnsName later
      updateWagmiEnsNameCache(wagmiQueryClient, result);
      return result;
    },
    {
      refetchOnWindowFocus: false,
      initialData: accounts,
      initialDataUpdatedAt: 0,
    },
  );

  return select(accountsWithEnsNames);
};

export const useVisibleAccounts = () => {
  const { hiddenWallets } = useHiddenWalletsStore();
  return useAccounts((allAccounts) => {
    const visibleAccounts = allAccounts.filter(
      (a) => !hiddenWallets[a.address],
    );
    const [watchedAccounts, ownedAccounts] = partition(
      visibleAccounts,
      ({ type }) => type === KeychainType.ReadOnlyKeychain,
    );

    return {
      accounts: visibleAccounts,
      ownedAccounts,
      watchedAccounts,
    };
  });
};

export const useCurrentAccount = () => {
  const { currentAddress } = useCurrentAddressStore();
  return useAccounts((accounts) => {
    const currentAccount = accounts.find((a) => a.address === currentAddress);
    return {
      ...currentAccount,
      isWatched: currentAccount?.type === KeychainType.ReadOnlyKeychain,
      isOwned: currentAccount?.type !== KeychainType.ReadOnlyKeychain,
    };
  });
};
