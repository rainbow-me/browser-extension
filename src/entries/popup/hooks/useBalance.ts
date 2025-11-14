import { useQuery } from '@tanstack/react-query';
import { Address, formatEther } from 'viem';
import { getBalance } from 'viem/actions';

import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { getViemClient } from '~/core/viem/clients';

export function useBalance({
  address,
  chainId,
  query,
}: {
  address?: Address;
  chainId?: ChainId;
  query?: { enabled?: boolean };
} = {}) {
  const enabled = query?.enabled !== undefined ? query.enabled : true;
  return useQuery({
    queryKey: ['balance', address, chainId],
    queryFn: async () => {
      if (!address || !chainId) return null;
      const client = getViemClient({ chainId });
      const balance = await getBalance(client, { address });
      const chains = useNetworkStore.getState().getAllActiveRpcChains();
      const chain = chains.find((c) => c.id === chainId);
      const nativeCurrency = chain?.nativeCurrency;
      return {
        value: balance,
        formatted: formatEther(balance),
        decimals: nativeCurrency?.decimals || 18,
        symbol: nativeCurrency?.symbol || 'ETH',
      };
    },
    enabled: enabled && !!address && !!chainId,
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });
}
