import { useQuery } from '@tanstack/react-query';

import { createHttpClient } from '~/core/network/internal/createHttpClient';
import { QueryFunctionArgs, createQueryKey } from '~/core/react-query';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';

import { parseTokenSearch } from './parseTokenSearch';

const popularInRainbowHttp = createHttpClient({
  baseUrl: 'https://token-search.rainbow.me/v3/discovery',
  timeout: 30000,
});

const popularInRainbowQueryKey = ({ chainId }: { chainId: ChainId }) =>
  createQueryKey('TokenDiscovery', { chainId }, { persisterVersion: 1 });

async function popularInRainbowQueryFunction({
  queryKey: [{ chainId }],
}: QueryFunctionArgs<typeof popularInRainbowQueryKey>) {
  const url = `/${chainId}`;

  try {
    const tokenSearch = await popularInRainbowHttp.get<{
      data: SearchAsset[];
    }>(url);
    return tokenSearch.data.data.map((asset) =>
      parseTokenSearch(asset, chainId),
    );
  } catch (e) {
    return [];
  }
}

export function usePopularInRainbow<T = SearchAsset[]>({
  chainId,
  select,
}: {
  chainId: ChainId;
  select?: (data: SearchAsset[]) => T;
}) {
  return useQuery({
    queryKey: popularInRainbowQueryKey({ chainId }),
    queryFn: popularInRainbowQueryFunction,
    staleTime: 15 * 60 * 1000, // 15 min
    gcTime: 24 * 60 * 60 * 1000, // 1 day
    select,
  });
}
