import { useMemo } from 'react';
import { type Address } from 'viem';

import { useWalletNamesStore } from '~/core/state/walletNames';
import { useWalletOrderStore } from '~/core/state/walletOrder';

import { useEnhanceWithEnsNames } from './useEnhanceWithEnsNames';
import { AddressAndType, useWallets } from './useWallets';

export type Account = AddressAndType & {
  walletName?: string;
  ensName?: string | null;
};

const sortAccounts = <Accounts extends Account[]>(
  order: Address[],
  accounts: Accounts,
) =>
  accounts.sort((a, b) => {
    const aIndex = order.indexOf(a.address);
    const bIndex = order.indexOf(b.address);
    if (aIndex === -1) return bIndex === -1 ? 0 : 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

type UseAccountsResult = { sortedAccounts: Account[] };
export const useAccounts = <TSelect = UseAccountsResult>(
  select: (a: UseAccountsResult) => TSelect = (a) => a as TSelect,
) => {
  const { visibleWallets: accounts } = useWallets();
  const { walletNames } = useWalletNamesStore();
  const { walletOrder } = useWalletOrderStore();

  const accountsWithNames = useMemo(
    () => accounts.map((a) => ({ ...a, walletName: walletNames[a.address] })),
    [accounts, walletNames],
  );
  const accountsWithNamesAndEns = useEnhanceWithEnsNames({
    accounts: accountsWithNames,
  });

  const sortedAccounts = useMemo(
    () => sortAccounts(walletOrder, accountsWithNamesAndEns),
    [accountsWithNamesAndEns, walletOrder],
  );

  return select({ sortedAccounts });
};
