import qs from 'qs';

import { tokenSearchHttp } from '~/core/network/tokenSearch';
import { ChainId } from '~/core/types/chains';
import { SearchAsset, TokenSearchListId } from '~/core/types/search';

import { parseTokenSearch } from './parseTokenSearch';
import {
  getManyTokenSearchFromCache,
  getTokenSearchFromCache,
  setTokenSearchInCache,
  toCacheKeyString,
} from './tokenSearchCache';

export type TokenSearchArgs = {
  chainId: ChainId;
  fromChainId?: ChainId | '';
  list: TokenSearchListId;
  query: string;
};

/**
 * Search tokens for a single chain. Cache-first, then HTTP.
 * No React or React Query dependencies.
 */
export async function searchTokenSearch(
  args: TokenSearchArgs,
): Promise<SearchAsset[]> {
  const { chainId, fromChainId, list, query } = args;
  const cached = await getTokenSearchFromCache(args);
  if (cached !== null) return cached;

  const queryParams: {
    list: TokenSearchListId;
    query?: string;
    fromChainId?: number;
  } = { list, query };
  if (fromChainId) queryParams.fromChainId = fromChainId;

  const url = `/${chainId}/?${qs.stringify(queryParams)}`;
  try {
    const res = await tokenSearchHttp.get<{ data: SearchAsset[] }>(url);
    const result = res.data.data.map((asset) =>
      parseTokenSearch(asset, chainId),
    );
    await setTokenSearchInCache(args, result);
    return result;
  } catch {
    return [];
  }
}

/**
 * Search tokens across multiple chains. Batch cache read, then fetch misses.
 * No React or React Query dependencies.
 */
export async function searchTokenSearchAllNetworks(
  args: Omit<TokenSearchArgs, 'chainId' | 'fromChainId'>,
  chainIds: ChainId[],
): Promise<SearchAsset[]> {
  const { list, query } = args;
  const cacheKeys = chainIds.map((chainId) => ({ chainId, list, query }));
  const cached = await getManyTokenSearchFromCache(cacheKeys);

  const results = await Promise.all(
    chainIds.map(async (chainId) => {
      const key = toCacheKeyString({ chainId, list, query });
      const hit = cached.get(key);
      if (hit) return hit;

      const queryParams: { list: TokenSearchListId; query?: string } = {
        list,
        query,
      };
      const url = `/${chainId}/?${qs.stringify(queryParams)}`;
      try {
        const res = await tokenSearchHttp.get<{ data: SearchAsset[] }>(url);
        const result = res.data.data.map((asset) =>
          parseTokenSearch(asset, chainId),
        );
        await setTokenSearchInCache({ chainId, list, query }, result);
        return result;
      } catch {
        return [];
      }
    }),
  );

  return results.flat();
}
