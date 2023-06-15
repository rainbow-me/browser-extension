import { useMemo } from 'react';

import { Contact } from '~/core/state/contacts';
import { KeychainType } from '~/core/types/keychainTypes';

import { Account, useAccounts } from '../useAccounts';
import { useContacts } from '../useContacts';

const filterWallets = (
  accounts: Partial<Account & Contact>[],
  _filter: string,
) => {
  const filter = _filter.trim();
  return accounts.filter(
    ({ address, name, ensName, walletName }) =>
      ensName?.toLowerCase().includes(filter.toLowerCase()) ||
      address?.toLowerCase().includes(filter.toLowerCase()) ||
      name?.toLowerCase().includes(filter.toLowerCase()) ||
      walletName?.toLowerCase().includes(filter.toLowerCase()),
  );
};

const isReadOnly = (a: Account) => a.type === KeychainType.ReadOnlyKeychain;
const isOwned = (a: Account) => !isReadOnly(a);

export const useAllFilteredWallets = ({ filter }: { filter: string }) => {
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
