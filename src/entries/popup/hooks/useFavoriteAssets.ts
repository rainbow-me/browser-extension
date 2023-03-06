import { isAddress } from 'ethers/lib/utils';
import { useCallback, useEffect, useState } from 'react';

import { fetchTokenSearch } from '~/core/resources/search/tokenSearch';
import { useFavoritesStore } from '~/core/state/favorites';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';

type FavoriteAssets = Record<ChainId, SearchAsset[]>;
const FAVORITES_EMPTY_STATE = {
  [ChainId.mainnet]: [],
  [ChainId.optimism]: [],
  [ChainId.bsc]: [],
  [ChainId.polygon]: [],
  [ChainId.arbitrum]: [],
};

export function useFavoriteAssets() {
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
  const [favoritesData, setFavoritesData] = useState<FavoriteAssets>(
    FAVORITES_EMPTY_STATE,
  );

  console.log('USE FAVORITE ASSETS: ', favorites);

  const setFavoriteAssetsData = useCallback(async () => {
    const chainIds = Object.keys(favorites).filter(
      (k) => favorites?.[parseInt(k)],
    );
    const searches: Promise<void>[] = [];
    const newSearchData = {} as Record<ChainId, SearchAsset[]>;
    for (const chain of chainIds) {
      const addressesByChain = favorites[parseInt(chain)];
      addressesByChain?.forEach((address) => {
        const searchAddress = async (add: string) => {
          const query = add.toLocaleLowerCase();
          const queryIsAddress = isAddress(query);
          const keys = (
            queryIsAddress ? ['address'] : ['name', 'symbol']
          ) as (keyof ParsedAsset)[];
          const threshold = queryIsAddress
            ? 'CASE_SENSITIVE_EQUAL'
            : 'CONTAINS';
          const results = await fetchTokenSearch({
            chainId: parseInt(chain),
            keys,
            list: 'verifiedAssets',
            threshold,
            query,
          });

          const currentFavoritesData = newSearchData[parseInt(chain)];
          if (results?.[0]) {
            newSearchData[parseInt(chain)] = [
              ...(currentFavoritesData || []),
              results?.[0],
            ];
          } else {
            const unverifiedSearchResults = await fetchTokenSearch({
              chainId: parseInt(chain),
              keys,
              list: 'highLiquidityAssets',
              threshold,
              query,
            });
            // eslint-disable-next-line require-atomic-updates
            newSearchData[parseInt(chain)] = [
              ...(currentFavoritesData || []),
              unverifiedSearchResults?.[0],
            ];
          }
        };
        searches.push(searchAddress(address));
      });
    }
    await Promise.all(searches);
    setFavoritesData(newSearchData);
  }, [favorites]);

  useEffect(() => {
    setFavoriteAssetsData();
  }, [setFavoriteAssetsData]);

  return {
    favorites: favoritesData,
    addFavorite,
    removeFavorite,
  };
}
