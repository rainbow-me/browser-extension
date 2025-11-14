import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getEnsName } from 'viem/actions';

import { ChainId } from '~/core/types/chains';
import { getViemClient } from '~/core/viem/clients';

export function useEnsName({
  address,
  chainId = ChainId.mainnet,
  query,
}: {
  address?: Address;
  chainId?: ChainId;
  query?: { enabled?: boolean };
} = {}) {
  const enabled = query?.enabled !== undefined ? query.enabled : true;
  return useQuery({
    queryKey: ['ensName', address, chainId],
    queryFn: async () => {
      if (!address) return null;
      return getEnsName(getViemClient({ chainId }), { address });
    },
    enabled: enabled && !!address,
    refetchOnWindowFocus: false,
    staleTime: 20 * 1000,
  });
}
