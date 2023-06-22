import { isAddress } from '@ethersproject/address';
import { rankings } from 'match-sorter';
import { useCallback, useMemo } from 'react';

import { useTokenSearch } from '~/core/resources/search';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { addHexPrefix } from '~/core/utils/hex';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { filterList } from '../utils/search';

import { useFavoriteAssets } from './useFavoriteAssets';

const VERIFIED_ASSETS_PAYLOAD: {
  keys: TokenSearchAssetKey[];
  list: TokenSearchListId;
  threshold: TokenSearchThreshold;
  query: string;
} = {
  keys: ['symbol', 'name'],
  list: 'verifiedAssets',
  threshold: 'CONTAINS',
  query: '',
};

export type AssetToBuySectionId =
  | 'bridge'
  | 'favorites'
  | 'verified'
  | 'unverified'
  | 'other_networks';

export interface AssetToBuySection {
  data: SearchAsset[];
  id: AssetToBuySectionId;
}

const filterBridgeAsset = ({
  asset,
  filter = '',
}: {
  asset?: SearchAsset;
  filter?: string;
}) =>
  asset?.address?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  asset?.name?.toLowerCase()?.startsWith(filter?.toLowerCase()) ||
  asset?.symbol?.toLowerCase()?.startsWith(filter?.toLowerCase());

export function useSearchCurrencyLists({
  assetToSell,
  inputChainId,
  outputChainId,
  searchQuery,
}: {
  assetToSell: SearchAsset | ParsedSearchAsset | null;
  // should be provided when swap input currency is selected
  inputChainId?: ChainId;
  // target chain id of current search
  outputChainId: ChainId;
  searchQuery?: string;
}) {
  const query = searchQuery?.toLowerCase() || '';

  const isCrosschainSearch = useMemo(() => {
    return inputChainId && inputChainId !== outputChainId;
  }, [inputChainId, outputChainId]);

  // provided during swap to filter token search by available routes
  const fromChainId = useMemo(() => {
    return isCrosschainSearch ? inputChainId : undefined;
  }, [inputChainId, isCrosschainSearch]);

  const queryIsAddress = useMemo(() => isAddress(query), [query]);

  const keys: TokenSearchAssetKey[] = useMemo(
    () => (queryIsAddress ? ['address'] : ['name', 'symbol']),
    [queryIsAddress],
  );

  const threshold: TokenSearchThreshold = useMemo(
    () => (queryIsAddress ? 'CASE_SENSITIVE_EQUAL' : 'CONTAINS'),
    [queryIsAddress],
  );

  // static search data
  const {
    data: mainnetVerifiedAssets,
    isLoading: mainnetVerifiedAssetsLoading,
  } = useTokenSearch({
    chainId: ChainId.mainnet,
    ...VERIFIED_ASSETS_PAYLOAD,
    fromChainId,
  });

  const {
    data: optimismVerifiedAssets,
    isLoading: optimismVerifiedAssetsLoading,
  } = useTokenSearch({
    chainId: ChainId.optimism,
    ...VERIFIED_ASSETS_PAYLOAD,
    fromChainId,
  });

  const { data: bscVerifiedAssets, isLoading: bscVerifiedAssetsLoading } =
    useTokenSearch({
      chainId: ChainId.bsc,
      ...VERIFIED_ASSETS_PAYLOAD,
      fromChainId,
    });

  const {
    data: polygonVerifiedAssets,
    isLoading: polygonVerifiedAssetsLoading,
  } = useTokenSearch({
    chainId: ChainId.polygon,
    ...VERIFIED_ASSETS_PAYLOAD,
    fromChainId,
  });

  const {
    data: arbitrumVerifiedAssets,
    isLoading: arbitrumVerifiedAssetsLoading,
  } = useTokenSearch({
    chainId: ChainId.arbitrum,
    ...VERIFIED_ASSETS_PAYLOAD,
    fromChainId,
  });

  // current search
  const { data: targetVerifiedAssets, isLoading: targetVerifiedAssetsLoading } =
    useTokenSearch({
      chainId: outputChainId,
      keys,
      list: 'verifiedAssets',
      threshold,
      query,
      fromChainId,
    });
  const {
    data: targetUnverifiedAssets,
    isLoading: targetUnverifiedAssetsLoading,
  } = useTokenSearch({
    chainId: outputChainId,
    keys,
    list: 'highLiquidityAssets',
    threshold,
    query,
    fromChainId,
  });

  const { favorites } = useFavoriteAssets();

  const favoritesList = useMemo(() => {
    const favoritesByChain = favorites[outputChainId];
    if (query === '') {
      return favoritesByChain;
    } else {
      const formattedQuery = queryIsAddress
        ? addHexPrefix(query).toLowerCase()
        : query;
      return filterList<SearchAsset>(
        favoritesByChain || [],
        formattedQuery,
        keys,
        {
          threshold: queryIsAddress
            ? rankings.CASE_SENSITIVE_EQUAL
            : rankings.CONTAINS,
        },
      );
    }
  }, [favorites, keys, outputChainId, query, queryIsAddress]);

  // static verified asset lists prefetched to display curated lists
  // we only display crosschain exact matches if located here
  const verifiedAssets = useMemo(
    () => ({
      [ChainId.mainnet]: {
        assets: mainnetVerifiedAssets,
        loading: mainnetVerifiedAssetsLoading,
      },
      [ChainId.optimism]: {
        assets: optimismVerifiedAssets,
        loading: optimismVerifiedAssetsLoading,
      },
      [ChainId.bsc]: {
        assets: bscVerifiedAssets,
        loading: bscVerifiedAssetsLoading,
      },
      [ChainId.polygon]: {
        assets: polygonVerifiedAssets,
        loading: polygonVerifiedAssetsLoading,
      },
      [ChainId.arbitrum]: {
        assets: arbitrumVerifiedAssets,
        loading: arbitrumVerifiedAssetsLoading,
      },
    }),
    [
      mainnetVerifiedAssets,
      mainnetVerifiedAssetsLoading,
      optimismVerifiedAssets,
      optimismVerifiedAssetsLoading,
      bscVerifiedAssets,
      bscVerifiedAssetsLoading,
      polygonVerifiedAssets,
      polygonVerifiedAssetsLoading,
      arbitrumVerifiedAssets,
      arbitrumVerifiedAssetsLoading,
    ],
  );

  const getCuratedAssets = useCallback(
    (chainId: ChainId) =>
      verifiedAssets[chainId].assets?.filter(
        ({ isRainbowCurated }) => isRainbowCurated,
      ),
    [verifiedAssets],
  );

  const bridgeAsset = useMemo(() => {
    const curatedAssets = getCuratedAssets(outputChainId);
    const bridgeAsset = curatedAssets?.find((asset) =>
      isLowerCaseMatch(
        asset.mainnetAddress,
        assetToSell?.[
          assetToSell?.chainId === ChainId.mainnet
            ? 'address'
            : 'mainnetAddress'
        ],
      ),
    );
    const filteredBridgeAsset = filterBridgeAsset({
      asset: bridgeAsset,
      filter: query,
    })
      ? bridgeAsset
      : null;
    return outputChainId === assetToSell?.chainId ? null : filteredBridgeAsset;
  }, [assetToSell, getCuratedAssets, outputChainId, query]);

  const loading = useMemo(() => {
    return query === ''
      ? verifiedAssets[outputChainId].loading
      : targetVerifiedAssetsLoading || targetUnverifiedAssetsLoading;
  }, [
    outputChainId,
    targetUnverifiedAssetsLoading,
    targetVerifiedAssetsLoading,
    query,
    verifiedAssets,
  ]);

  // displayed when no search query is present
  const curatedAssets = useMemo(
    () => ({
      [ChainId.mainnet]: getCuratedAssets(ChainId.mainnet),
      [ChainId.optimism]: getCuratedAssets(ChainId.optimism),
      [ChainId.bsc]: getCuratedAssets(ChainId.bsc),
      [ChainId.polygon]: getCuratedAssets(ChainId.polygon),
      [ChainId.arbitrum]: getCuratedAssets(ChainId.arbitrum),
    }),
    [getCuratedAssets],
  );

  const crosschainExactMatches = Object.values(verifiedAssets)
    ?.map((verifiedList) => {
      return verifiedList.assets?.filter((t) => {
        const symbolMatch = isLowerCaseMatch(t?.symbol, query);
        const nameMatch = isLowerCaseMatch(t?.name, query);
        return symbolMatch || nameMatch;
      });
    })
    .flat()
    .filter(Boolean);

  const filterAssetsFromBridgeAndAssetToSell = useCallback(
    (assets?: SearchAsset[]) =>
      assets?.filter(
        (curatedAsset) =>
          !isLowerCaseMatch(curatedAsset?.address, bridgeAsset?.address) &&
          !isLowerCaseMatch(curatedAsset?.address, assetToSell?.address),
      ) || [],
    [assetToSell?.address, bridgeAsset?.address],
  );

  const filterAssetsFromFavoritesBridgeAndAssetToSell = useCallback(
    (assets?: SearchAsset[]) =>
      filterAssetsFromBridgeAndAssetToSell(assets)?.filter(
        (curatedAsset) =>
          !favoritesList
            ?.map((fav) => fav.address)
            .includes(curatedAsset.address),
      ) || [],
    [favoritesList, filterAssetsFromBridgeAndAssetToSell],
  );

  // the lists below should be filtered by favorite/bridge asset match
  const results = useMemo(() => {
    const sections: AssetToBuySection[] = [];
    if (bridgeAsset) {
      const bridgeSection = {
        data: [bridgeAsset],
        id: 'bridge' as AssetToBuySectionId,
      };
      sections.push(bridgeSection);
    }
    if (favoritesList?.length) {
      const favoritesSection = {
        data: filterAssetsFromBridgeAndAssetToSell(favoritesList),
        id: 'favorites' as AssetToBuySectionId,
      };
      sections.push(favoritesSection);
    }

    if (query === '') {
      const curatedSection = {
        data: filterAssetsFromFavoritesBridgeAndAssetToSell(
          curatedAssets[outputChainId],
        ),
        id: 'verified' as AssetToBuySectionId,
      };
      sections.push(curatedSection);
    } else {
      if (targetVerifiedAssets?.length) {
        const verifiedSection = {
          data: filterAssetsFromFavoritesBridgeAndAssetToSell(
            targetVerifiedAssets,
          ),
          id: 'verified' as AssetToBuySectionId,
        };
        sections.push(verifiedSection);
      }

      if (targetUnverifiedAssets?.length) {
        const unverifiedSection = {
          data: filterAssetsFromFavoritesBridgeAndAssetToSell(
            targetUnverifiedAssets,
          ),
          id: 'unverified' as AssetToBuySectionId,
        };
        sections.push(unverifiedSection);
      }

      if (!sections.length && crosschainExactMatches?.length) {
        const crosschainSection = {
          data: filterAssetsFromFavoritesBridgeAndAssetToSell(
            crosschainExactMatches,
          ),
          id: 'other_networks' as AssetToBuySectionId,
        };
        sections.push(crosschainSection);
      }
    }

    return sections;
  }, [
    bridgeAsset,
    favoritesList,
    query,
    filterAssetsFromBridgeAndAssetToSell,
    filterAssetsFromFavoritesBridgeAndAssetToSell,
    curatedAssets,
    outputChainId,
    targetVerifiedAssets,
    targetUnverifiedAssets,
    crosschainExactMatches,
  ]);

  return {
    loading,
    results,
  };
}
