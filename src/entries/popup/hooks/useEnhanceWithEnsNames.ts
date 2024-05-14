import { useQueries } from '@tanstack/react-query';
import { getEnsName } from '@wagmi/core';
import { Address, GetEnsNameReturnType } from 'viem';

import { ChainId } from '~/core/types/chains';
import { wagmiConfig } from '~/core/utils/chains';

// Initially returns the same "accounts" list, and update the list with ensName after fetching
export const useEnhanceWithEnsNames = <
  TAccounts extends { address: Address }[],
>({
  accounts,
  chainId = ChainId.mainnet,
}: {
  accounts: TAccounts;
  chainId?: ChainId;
}): (TAccounts[number] & { ensName?: GetEnsNameReturnType })[] => {
  const queries = useQueries({
    queries: accounts.map((account) => ({
      queryFn: () => getEnsName(wagmiConfig, { address: account.address }),
      queryKey: [{ entity: 'ensName', address: account.address, chainId }], // same as wagmi query key so we share the cache
      refetchOnWindowFocus: false,
      staleTime: 20 * 1000, // 20s
    })),
  });

  return queries.map(({ data: ensName }, i) => ({ ...accounts[i], ensName }));
};
