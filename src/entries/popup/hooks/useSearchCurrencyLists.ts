import { isAddress } from '@ethersproject/address';
import { rankings } from 'match-sorter';
import { useEffect, useMemo, useRef } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import { analytics } from '~/analytics';
import { addHexPrefix } from '~/core/utils/hex';
import { ChainId } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { getUniqueId } from '~/core/utils/address';
import {
  ADDRESS_SEARCH_KEY,
  NAME_SYMBOL_SEARCH_KEYS,
  useSwapsSearchStore,
  useTokenSearchStore,
} from '~/core/resources/search/tokenSearchV2';
import { SearchAsset, AssetToBuySectionId, TokenToBuyListItem } from '~/core/types/search';
import { filterList } from '../utils/search';
import { usePopularTokensStore } from '~/core/resources/search/popularInRainbow';
import { ParsedSearchAsset } from '~/core/types/assets';
import { useFavoriteAssets } from './useFavoriteAssets';

const ANALYTICS_LOG_THROTTLE_MS = 5 * 1000;
const MAX_POPULAR_RESULTS = 3;

export function useSearchCurrencyLists({
  inputAsset,
  outputAsset,
  searchQuery,
  bridge,
}: {
  inputAsset: ParsedSearchAsset | null;
  outputAsset: ParsedSearchAsset | null;
  searchQuery: string;
  bridge: boolean;
}) {
  const lastTrackedTimeRef = useRef<number | null>(null);
  const searchResults = useTokenSearchStore(state => state.getData());
  const popularAssets = usePopularTokensStore(state => state.getData());

  const isCrosschainSearch = inputAsset ? inputAsset?.chainId !== (outputAsset?.chainId ?? ChainId.mainnet) : false;
  const query = searchQuery.trim().toLowerCase();
  const toChainId = outputAsset?.chainId ?? ChainId.mainnet;
  const { favorites } = useFavoriteAssets(toChainId);

  const [isContractSearch, keys] = useMemo(() => {
    const isContract = isAddress(query);
    return [isContract, isContract ? ADDRESS_SEARCH_KEY : NAME_SYMBOL_SEARCH_KEYS];
  }, [query]);

  const unfilteredFavorites = useMemo(() => {
    return Object.values(favorites)
      .filter(token => token.networks[toChainId])
      .map(favToken => ({
        ...favToken,
        address: favToken.networks?.[toChainId]?.address || favToken.address,
        chainId: toChainId,
        favorite: true,
        mainnetAddress: favToken.networks?.[ChainId.mainnet]?.address || favToken.mainnetAddress,
        uniqueId: getUniqueId(favToken.networks?.[toChainId]?.address || favToken.address, toChainId),
      })) as SearchAsset[];
  }, [favorites, toChainId]);

  const filteredBridgeAsset = useDeepCompareMemo(() => {
    if (!searchResults?.bridgeAsset) return null;

    const inputAssetBridgedToSelectedChainAddress = inputAsset?.networks?.[toChainId]?.address;

    const shouldShowBridgeResult =
      isCrosschainSearch &&
      inputAssetBridgedToSelectedChainAddress &&
      inputAssetBridgedToSelectedChainAddress === searchResults?.bridgeAsset?.networks?.[toChainId]?.address &&
      filterBridgeAsset({ asset: searchResults?.bridgeAsset, filter: query });

    return shouldShowBridgeResult && searchResults.bridgeAsset
      ? {
          ...searchResults.bridgeAsset,
          chainId: toChainId,
          favorite: unfilteredFavorites.some(
            fav =>
              fav.networks?.[toChainId]?.address ===
              (searchResults?.bridgeAsset?.networks?.[toChainId]?.address || inputAssetBridgedToSelectedChainAddress)
          ),
        }
      : null;
  }, [isCrosschainSearch, query, toChainId, unfilteredFavorites, searchResults?.bridgeAsset]);

  const favoritesList = useDeepCompareMemo(() => {
    if (query === '') return unfilteredFavorites;
    else
      return filterList(unfilteredFavorites || [], isContractSearch ? addHexPrefix(query).toLowerCase() : query, keys, {
        threshold: isContractSearch ? rankings.CASE_SENSITIVE_EQUAL : rankings.CONTAINS,
      });
  }, [isContractSearch, keys, query, unfilteredFavorites]);

  const popularAssetsForChain = useDeepCompareMemo(() => {
    if (!popularAssets) return [];
    if (!query) return popularAssets;
    return filterList(popularAssets, query, keys, {
      threshold: isContractSearch ? rankings.CASE_SENSITIVE_EQUAL : rankings.CONTAINS,
    });
  }, [isContractSearch, keys, popularAssets, query]);

  const data = useMemo(() => {
    return {
      isLoading: false,
      results: buildListSectionsData({
        combinedData: {
          bridgeAsset: filteredBridgeAsset,
          crosschainExactMatches: searchResults?.crosschainResults,
          popularAssets: popularAssetsForChain,
          unverifiedAssets: searchResults?.unverifiedAssets,
          verifiedAssets: searchResults?.verifiedAssets,
        },
        favoritesList,
        filteredBridgeAssetAddress: filteredBridgeAsset?.address,
      }),
    };
  }, [
    favoritesList,
    filteredBridgeAsset,
    popularAssetsForChain,
    searchResults?.crosschainResults,
    searchResults?.verifiedAssets,
    searchResults?.unverifiedAssets,
  ]);

  useEffect(() => {
    const query = useSwapsSearchStore.getState().searchQuery.trim();
    const now = Date.now();
    if (
      query.length <= 2 ||
      (lastTrackedTimeRef.current && now - lastTrackedTimeRef.current < ANALYTICS_LOG_THROTTLE_MS) ||
      useTokenSearchStore.getState().status !== 'success'
    ) {
      return;
    }
    lastTrackedTimeRef.current = now;
    const params = { screen: 'swap' as const, total_tokens: 0, no_icon: 0, query };
    for (const assetOrHeader of data.results) {
      if (assetOrHeader.listItemType === 'header') continue;
      if (!assetOrHeader.icon_url) params.no_icon += 1;
      params.total_tokens += 1;
    }
    analytics.track(analytics.event.tokenList, params);
  }, [data.results]);

  return data;
}

const mergeAssetsFavoriteStatus = ({
  assets,
  favoritesList,
}: {
  assets: SearchAsset[] | undefined;
  favoritesList: SearchAsset[] | undefined;
}): SearchAsset[] => assets?.map(asset => ({ ...asset, favorite: favoritesList?.some(fav => fav.address === asset.address) })) || [];

const filterAssetsFromBridge = ({
  assets,
  filteredBridgeAssetAddress,
}: {
  assets: SearchAsset[] | undefined;
  filteredBridgeAssetAddress: string | undefined;
}): SearchAsset[] => assets?.filter(curatedAsset => !isLowerCaseMatch(curatedAsset?.address, filteredBridgeAssetAddress)) || [];

const filterAssetsFromPopularAssets = ({
  assets,
  popularAssets,
}: {
  assets: SearchAsset[] | undefined;
  popularAssets: SearchAsset[] | undefined;
}): SearchAsset[] => (assets || []).filter(asset => !popularAssets?.some(popular => popular.address === asset.address));

const filterAssetsFromBridgeAndPopular = ({
  assets,
  popularAssets,
  filteredBridgeAssetAddress,
}: {
  assets: SearchAsset[] | undefined;
  popularAssets: SearchAsset[] | undefined;
  filteredBridgeAssetAddress: string | undefined;
}): SearchAsset[] =>
  filterAssetsFromPopularAssets({
    assets: filterAssetsFromBridge({ assets, filteredBridgeAssetAddress }),
    popularAssets,
  });

const filterAssetsFromFavoritesAndBridgeAndPopular = ({
  assets,
  favoritesList,
  filteredBridgeAssetAddress,
  popularAssets,
}: {
  assets: SearchAsset[] | undefined;
  favoritesList: SearchAsset[] | undefined;
  filteredBridgeAssetAddress: string | undefined;
  popularAssets: SearchAsset[] | undefined;
}): SearchAsset[] =>
  filterAssetsFromPopularAssets({
    assets: filterAssetsFromBridge({ assets, filteredBridgeAssetAddress }),
    popularAssets,
  })?.filter(
    curatedAsset => !favoritesList?.some(({ address }) => curatedAsset.address === address || curatedAsset.mainnetAddress === address)
  ) || [];

const filterBridgeAsset = ({ asset, filter = '' }: { asset: SearchAsset | null | undefined; filter: string }) =>
  filter.length === 0 ||
  asset?.address?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  asset?.name?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  asset?.symbol?.toLowerCase()?.startsWith(filter?.toLowerCase());

const buildListSectionsData = ({
  combinedData,
  favoritesList,
  filteredBridgeAssetAddress,
}: {
  combinedData: {
    bridgeAsset: SearchAsset | null;
    verifiedAssets: SearchAsset[] | undefined;
    unverifiedAssets: SearchAsset[] | undefined;
    crosschainExactMatches: SearchAsset[] | undefined;
    popularAssets: SearchAsset[] | undefined;
  };
  favoritesList: SearchAsset[] | undefined;
  filteredBridgeAssetAddress: string | undefined;
}): TokenToBuyListItem[] => {
  const formattedData: TokenToBuyListItem[] = [];

  const addSection = (id: AssetToBuySectionId, assets: SearchAsset[]) => {
    if (assets.length > 0) {
      formattedData.push({ listItemType: 'header', id, data: assets });
      assets.forEach(item => formattedData.push({ ...item, sectionId: id, listItemType: 'coinRow' }));
    }
  };

  if (combinedData.bridgeAsset) {
    addSection(
      'bridge',
      mergeAssetsFavoriteStatus({
        assets: [combinedData.bridgeAsset],
        favoritesList,
      })
    );
  }

  if (combinedData.popularAssets?.length) {
    const filteredPopular = filterAssetsFromBridge({
      assets: combinedData.popularAssets,
      filteredBridgeAssetAddress,
    }).slice(0, MAX_POPULAR_RESULTS);
    addSection(
      'popular',
      mergeAssetsFavoriteStatus({
        assets: filteredPopular,
        favoritesList,
      })
    );
  }

  if (favoritesList?.length) {
    const filteredFavorites = filterAssetsFromBridgeAndPopular({
      assets: favoritesList,
      filteredBridgeAssetAddress,
      popularAssets: combinedData.popularAssets,
    });
    addSection('favorites', filteredFavorites);
  }

  if (combinedData.verifiedAssets?.length) {
    const filteredVerified = filterAssetsFromFavoritesAndBridgeAndPopular({
      assets: combinedData.verifiedAssets,
      favoritesList,
      filteredBridgeAssetAddress,
      popularAssets: combinedData.popularAssets,
    });
    addSection('verified', filteredVerified);
  }

  if (!formattedData.length && combinedData.crosschainExactMatches?.length) {
    const filteredCrosschain = filterAssetsFromFavoritesAndBridgeAndPopular({
      assets: combinedData.crosschainExactMatches,
      favoritesList,
      filteredBridgeAssetAddress,
      popularAssets: combinedData.popularAssets,
    });
    addSection('other_networks', filteredCrosschain);
  }

  if (combinedData.unverifiedAssets?.length) {
    const filteredUnverified = filterAssetsFromFavoritesAndBridgeAndPopular({
      assets: combinedData.unverifiedAssets,
      favoritesList,
      filteredBridgeAssetAddress,
      popularAssets: combinedData.popularAssets,
    });
    addSection('unverified', filteredUnverified);
  }

  return formattedData;
};