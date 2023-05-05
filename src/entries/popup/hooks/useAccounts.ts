import { useEffect, useMemo, useState } from 'react';

import { useWalletNamesStore } from '~/core/state/walletNames';
import { useWalletOrderStore } from '~/core/state/walletOrder';

import { AddressAndType, useWallets } from './useWallets';

interface WalletSearchData extends AddressAndType {
  walletName?: string;
  ensName?: string;
}

export const useAccounts = (searchQuery?: string) => {
  const { visibleWallets: accounts } = useWallets();
  const [accountsWithNamesAndEns, setAccountsWithNamesAndEns] = useState<
    WalletSearchData[]
  >([]);
  const { walletNames } = useWalletNamesStore();
  const { walletOrder } = useWalletOrderStore();

  useEffect(() => {
    const getAccountsWithNamesAndEns = async () => {
      if (accounts.length !== 0) {
        setAccountsWithNamesAndEns(accounts as WalletSearchData[]);
      }
      const accountsSearchData = await Promise.all(
        accounts.map(async (addressAndType) =>
          walletNames[addressAndType.address]
            ? {
                ...addressAndType,
                walletName: walletNames[addressAndType.address],
              }
            : (addressAndType as WalletSearchData),
        ),
      );
      if (accountsSearchData.length !== 0) {
        setAccountsWithNamesAndEns(accountsSearchData);
      }
    };
    getAccountsWithNamesAndEns();
  }, [accounts, walletNames]);
  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accountsWithNamesAndEns;
    return accountsWithNamesAndEns.filter(
      ({ address, walletName, ensName }) =>
        address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        walletName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ensName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [accountsWithNamesAndEns, searchQuery]);
  const filteredAndSortedAccounts = useMemo(() => {
    const sortedAccounts = filteredAccounts.sort((a, b) => {
      const aIndex = walletOrder.indexOf(a.address);
      const bIndex = walletOrder.indexOf(b.address);
      if (aIndex === -1 && bIndex === -1) {
        return 0;
      }
      if (aIndex === -1) {
        return 1;
      }
      if (bIndex === -1) {
        return -1;
      }
      return aIndex - bIndex;
    });
    return sortedAccounts;
  }, [filteredAccounts, walletOrder]);

  return {
    filteredAndSortedAccounts,
    sortedAccounts: accountsWithNamesAndEns,
  };
};
