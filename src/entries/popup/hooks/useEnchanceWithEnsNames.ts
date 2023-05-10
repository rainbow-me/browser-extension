import { useQueries } from '@tanstack/react-query';
import { Address, FetchEnsNameResult, fetchEnsName } from '@wagmi/core';
import { useMemo } from 'react';

import { ChainId } from '~/core/types/chains';

// Initially returns the same "accounts" list, and update the list with ensName when finish fetching
export const useEnchanceWithEnsNames = <
  TAccounts extends { address: Address }[],
>({
  accounts,
  chainId = ChainId.mainnet,
}: {
  accounts: TAccounts;
  chainId?: ChainId;
}) => {
  const queries = useQueries({
    queries: accounts.map((account) => ({
      queryFn: () => fetchEnsName({ chainId, address: account.address }),
      queryKey: [{ entity: 'ensName', address: account.address, chainId }], // same as wagmi query key
      refetchOnWindowFocus: false,
      initialData: null,
      initialDataUpdatedAt: 0,
      select: (ensName: FetchEnsNameResult) => ({
        ...account,
        ensName,
      }),
    })),
  });

  return useMemo(
    () => queries.map(({ data }, i) => data || accounts[i]),
    [queries, accounts],
  );
};
