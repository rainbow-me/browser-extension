import { useQuery } from '@tanstack/react-query';

import { createHttpClient } from '~/core/network/internal/createHttpClient';
import { QueryFunctionArgs, createQueryKey } from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';

import { parseTokenSearch } from './parseTokenSearch';

const tokenSearchDiscoveryHttp = createHttpClient({
  baseUrl: 'https://token-search.rainbow.me/v3/discovery',
  timeout: 30000,
});

type TokenDiscoveryArgs = {
  chainId: ChainId;
};

const tokenDiscoveryQueryKey = ({ chainId }: TokenDiscoveryArgs) =>
  createQueryKey('TokenDiscovery', { chainId }, { persisterVersion: 1 });

async function tokenSearchQueryFunction({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof tokenDiscoveryQueryKey>) {
  const url = `/${chainId}`;

  try {
    const tokenSearch = await tokenSearchDiscoveryHttp.get<{
      data: SearchAsset[];
    }>(url);
    return tokenSearch.data.data.map((asset) =>
      parseTokenSearch(asset, chainId),
    );
  } catch (e) {
    return [];
  }
}

export function useTokenDiscovery({ chainId }: TokenDiscoveryArgs) {
  return useQuery({
    queryKey: tokenDiscoveryQueryKey({ chainId }),
    queryFn: tokenSearchQueryFunction,
    staleTime: 15 * 60 * 1000, // 15 min
    gcTime: 24 * 60 * 60 * 1000, // 1 day
  });
}
