import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { createQueryKey } from '~/core/react-query';
import { fetchTokenSearch } from '~/core/resources/search/tokenSearch';
import { useFavoritesStore } from '~/core/state/favorites';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

async function fetchFavoriteToken(address: AddressOrEth, chain: ChainId) {
  const results = await fetchTokenSearch({
    chainId: chain,
    keys: ['address'],
    list: 'verifiedAssets',
    threshold: 'CASE_SENSITIVE_EQUAL',
    query: address.toLowerCase(),
  });
  if (results?.[0]) return results[0];

  const unverifiedSearchResults = await fetchTokenSearch({
    chainId: chain,
    keys: ['address'],
    list: 'highLiquidityAssets',
    threshold: 'CASE_SENSITIVE_EQUAL',
    query: address.toLowerCase(),
  });
  if (!unverifiedSearchResults?.[0]) return unverifiedSearchResults[0];
}

export function useFavoriteAssets(chainId: ChainId) {
  const favorites = useFavoritesStore((s) => s.favorites[chainId]);

  const { data = [] } = useQuery({
    queryKey: createQueryKey('favorites assets', { chainId, favorites }),
    queryFn: async () => {
      if (!favorites) throw new Error('No chain favorites');
      return (
        await Promise.all(
          favorites.map((address) => fetchFavoriteToken(address, chainId)),
        )
      ).filter(Boolean);
    },
    placeholderData: keepPreviousData,
  });

  return { favorites: data };
}
