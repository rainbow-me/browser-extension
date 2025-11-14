import { useQuery } from '@tanstack/react-query';
import { getEnsAddress } from 'viem/actions';

import { ChainId } from '~/core/types/chains';
import { getViemClient } from '~/core/viem/clients';

export function useEnsAddress({
  name,
  chainId = ChainId.mainnet,
  query,
}: {
  name?: string;
  chainId?: ChainId;
  query?: { enabled?: boolean };
} = {}) {
  const enabled = query?.enabled !== undefined ? query.enabled : true;
  return useQuery({
    queryKey: ['ensAddress', name, chainId],
    queryFn: async () => {
      if (!name) return null;
      return getEnsAddress(getViemClient({ chainId }), { name });
    },
    enabled: enabled && !!name,
    refetchOnWindowFocus: false,
    staleTime: 20 * 1000,
  });
}
