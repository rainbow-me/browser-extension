import { useMemo } from 'react';
import { Address } from 'wagmi';

import { useVisibleAccounts } from '../useAccounts';
import { useContacts } from '../useContacts';

interface WalletData {
  ensName?: string | null;
  address: Address;
  name?: string;
  walletName?: string;
}

const searchWalletData = (search: string) => (data: WalletData) => {
  if (!search) return true;
  const filter = search.toLowerCase();
  return (
    data.ensName?.toLowerCase().includes(filter) ||
    data.address?.toLowerCase().includes(filter) ||
    data.name?.toLowerCase().includes(filter) ||
    data.walletName?.toLowerCase().includes(filter)
  );
};

export const useAllFilteredWallets = (searchQuery: string) => {
  const { ownedAccounts, watchedAccounts } = useVisibleAccounts();
  const contacts = useContacts();

  return useMemo(() => {
    const filterFn = searchWalletData(searchQuery);
    return {
      wallets: ownedAccounts.filter(filterFn).map((a) => a.address),
      watchedWallets: watchedAccounts.filter(filterFn).map((a) => a.address),
      contacts: contacts.filter(filterFn).map((a) => a.address),
    };
  }, [contacts, ownedAccounts, watchedAccounts, searchQuery]);
};
