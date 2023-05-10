import { partition } from 'lodash';
import { useCallback } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useHiddenWalletsStore } from '~/core/state/hiddenWallets';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { useWalletOrderStore } from '~/core/state/walletOrder';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';

import { useEnchanceWithEnsNames } from './useEnchanceWithEnsNames';
import { AddressAndType, useWallets } from './useWallets';

export type Account = AddressAndType & {
  walletName?: string;
  ensName?: string | null;
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

  const accountsWithEnsNames = useEnchanceWithEnsNames({ accounts });

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
