import { useQueries } from '@tanstack/react-query';
import { Address, GetEnsNameReturnType } from 'viem';
import { getEnsName } from 'viem/actions';

import { ChainId } from '~/core/types/chains';
import { getViemClient } from '~/core/viem/clients';

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
      queryFn: async () =>
        getEnsName(getViemClient({ chainId }), { address: account.address }),
      queryKey: ['ensName', account.address, chainId],
      refetchOnWindowFocus: false,
      staleTime: 20 * 1000, // 20s
    })),
  });

  return queries.map(({ data: ensName }, i) => ({ ...accounts[i], ensName }));
};
