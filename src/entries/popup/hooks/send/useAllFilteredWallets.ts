import { useMemo } from 'react';
import { Address } from 'viem';

import { Contact } from '~/core/state/contacts';
import { KeychainType } from '~/core/types/keychainTypes';

import { Account, useAccounts } from '../useAccounts';
import { useContacts } from '../useContacts';

const filterWallets = (
  accounts: (Partial<Contact & Account> & { address: Address })[],
  _filter?: string,
) => {
  if (!_filter) return accounts;
  const filter = _filter.trim().toLowerCase();
  return accounts.filter(
    ({ address, name, ensName, walletName }) =>
      ensName?.toLowerCase().includes(filter) ||
      address?.toLowerCase().includes(filter) ||
      name?.toLowerCase().includes(filter) ||
      walletName?.toLowerCase().includes(filter),
  );
};

const isReadOnly = (a: Account) => a.type === KeychainType.ReadOnlyKeychain;
const isOwned = (a: Account) => !isReadOnly(a);

export const useAllFilteredWallets = ({ filter }: { filter?: string }) => {
  const contacts = useContacts();
  const { visibleOwnedWallets, watchedWallets } = useAccounts(
    ({ sortedAccounts }) => ({
      visibleOwnedWallets: sortedAccounts.filter(isOwned),
      watchedWallets: sortedAccounts.filter(isReadOnly),
    }),
  );

  return useMemo(
    () => ({
      wallets: filterWallets(visibleOwnedWallets, filter).map((a) => a.address),
      watchedWallets: filterWallets(watchedWallets, filter).map(
        (a) => a.address,
      ),
      contacts: filterWallets(contacts, filter).map((a) => a.address),
    }),
    [visibleOwnedWallets, watchedWallets, contacts, filter],
  );
};
