import { useQueries } from '@tanstack/react-query';
import { uniqBy } from 'lodash';
import { useMemo } from 'react';
import { Address, isAddress } from 'viem';

import { useAssetSearchMetadataAllNetworks } from '~/core/resources/assets/assetMetadata';
import { useTokenSearch } from '~/core/resources/search';
import { usePopularInRainbow } from '~/core/resources/search/popularInRainbow';
import {
  tokenSearchQueryFunction,
  tokenSearchQueryKey,
  useTokenSearchAllNetworks,
} from '~/core/resources/search/tokenSearch';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset, TokenSearchListId } from '~/core/types/search';
import { isSameAsset } from '~/core/utils/assets';
import { getChain, isNativeAsset } from '~/core/utils/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useFavoriteAssets } from './useFavoriteAssets';
import { useUserChains } from './useUserChains';

const VERIFIED_ASSETS_PAYLOAD: {
  list: TokenSearchListId;
  query: string;
} = {
  list: 'verifiedAssets',
  query: '',
};

export type AssetToBuySectionId =
  | 'bridge'
  | 'favorites'
  | 'verified'
  | 'unverified'
  | 'other_networks'
  | 'popular';

export interface AssetToBuySection {
  data: SearchAsset[];
  id: AssetToBuySectionId;
}

export enum AssetToBuyNetworkSearchStatus {
  all = 'all',
  single = 'single',
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

/**
 * @returns a new array of `assets` that don't overlap with `others`
 */
function difference(
  assets: SearchAsset[],
  others: (SearchAsset | undefined | null)[],
) {
  const _others = others.filter(Boolean);
  return assets.filter((asset) => {
    return !_others.some((other) =>
      isLowerCaseMatch(other.uniqueId, asset.uniqueId),
    );
  });
}

function useVerifiedAssetsForSupportedChains(fromChainId?: number) {
  const { chains } = useUserChains();

  const queries = chains.map(({ id }) => ({
    queryKey: tokenSearchQueryKey({
      ...VERIFIED_ASSETS_PAYLOAD,
      chainId: id,
      fromChainId,
    }),
    queryFn: tokenSearchQueryFunction,
    refetchOnWindowFocus: false,
  }));

  const results = useQueries({
    queries,
  });

  return {
    data: chains.reduce(
      (acc, { id }, index) => {
        acc[id] = results[index].data || [];
        return acc;
      },
      {} as Record<ChainId, SearchAsset[]>,
    ),
    isLoading: results.some((result) => result.isLoading),
  };
}

function queryMatchesAsset(
  query: string,
  { symbol, name, address, mainnetAddress }: SearchAsset,
) {
  return (
    symbol.toLowerCase().includes(query) ||
    name.toLowerCase().includes(query) ||
    isLowerCaseMatch(address, query) ||
    isLowerCaseMatch(mainnetAddress, query)
  );
}

export function useSearchCurrencyLists({
  assetToSell,
  inputChainId,
  outputChainId,
  searchQuery,
  bridge,
}: {
  assetToSell: SearchAsset | ParsedSearchAsset | null;
  // should be provided when swap input currency is selected
  inputChainId?: ChainId;
  // target chain id of current search
  outputChainId: ChainId;
  searchQuery?: string;
  // only show same asset on multiple chains
  bridge?: boolean;
}) {
  const query = searchQuery?.toLowerCase() || '';
  const enableUnverifiedSearch = query.trim().length > 2;

  const isCrosschainSearch = inputChainId && inputChainId !== outputChainId;

  // provided during swap to filter token search by available routes
  const fromChainId = isCrosschainSearch ? inputChainId : undefined;

  const { testnetMode } = useTestnetModeStore();
  const supportedChains = useNetworkStore((state) =>
    state.getBackendSupportedChains(true),
  );

  const enableAllNetworkTokenSearch =
    isAddress(query) && !testnetMode && !bridge;

  const networkSearchStatus = enableAllNetworkTokenSearch
    ? AssetToBuyNetworkSearchStatus.all
    : AssetToBuyNetworkSearchStatus.single;

  const { data: verifiedAssets, isLoading: verifiedAssetsLoading } =
    useVerifiedAssetsForSupportedChains(fromChainId);

  // current search
  const { data: targetVerifiedAssets, isLoading: targetVerifiedAssetsLoading } =
    useTokenSearch(
      {
        chainId: outputChainId,
        list: 'verifiedAssets',
        query,
        fromChainId,
      },
      {
        enabled: !enableAllNetworkTokenSearch,
      },
    );
  const {
    data: targetUnverifiedAssets,
    isLoading: targetUnverifiedAssetsLoading,
  } = useTokenSearch(
    {
      chainId: outputChainId,
      list: 'highLiquidityAssets',
      query,
      fromChainId,
    },
    {
      enabled: enableUnverifiedSearch && !enableAllNetworkTokenSearch,
    },
  );

  // All verified assets from all user chains
  const { data: targetAllNetworksUnverifiedAssets } = useTokenSearchAllNetworks(
    { list: 'highLiquidityAssets', query },
    {
      select: (data: SearchAsset[]) => {
        if (!enableAllNetworkTokenSearch) return [];
        return data;
      },
      enabled: enableAllNetworkTokenSearch,
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );

  // All verified assets from all user chains
  const { data: targetAllNetworksVerifiedAssets } = useTokenSearchAllNetworks(
    { list: 'verifiedAssets', query },
    {
      select: (data: SearchAsset[]) => {
        if (!enableAllNetworkTokenSearch) return [];
        return data;
      },
      enabled: enableAllNetworkTokenSearch,
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );

  // All on chain searched assets from all user chains
  const { data: targetAllNetworkMetadataAssets } =
    useAssetSearchMetadataAllNetworks(
      {
        assetAddress: query as Address,
      },
      {
        select: (data) => {
          if (!enableAllNetworkTokenSearch) return null;
          return data;
        },
        enabled: enableAllNetworkTokenSearch,
        staleTime: 10 * 60 * 1_000, // 10 min
      },
    );

  const { data: popularAssets = [] } = usePopularInRainbow({
    chainId: outputChainId,
    select(popularAssets) {
      if (!query) return popularAssets.slice(0, 3);
      const a = popularAssets.filter((asset) =>
        queryMatchesAsset(query, asset),
      );
      return a;
    },
  });

  const { favorites } = useFavoriteAssets(outputChainId);

  const favoritesList = useMemo(() => {
    if (!query) return favorites;
    return favorites.filter((asset) => queryMatchesAsset(query, asset));
  }, [favorites, query]);

  const bridgeAsset = useMemo(() => {
    const curatedAssets = verifiedAssets[outputChainId];
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
  }, [assetToSell, verifiedAssets, outputChainId, query]);

  const loading = useMemo(() => {
    return query === ''
      ? verifiedAssetsLoading
      : targetVerifiedAssetsLoading || targetUnverifiedAssetsLoading;
  }, [
    targetUnverifiedAssetsLoading,
    targetVerifiedAssetsLoading,
    query,
    verifiedAssetsLoading,
  ]);

  const bridgeList = (
    bridge && assetToSell?.networks
      ? Object.entries(assetToSell.networks).map(
          ([_chainId, assetOnNetworkOverrides]) => {
            if (!assetOnNetworkOverrides) return;
            const chainId = +_chainId as unknown as ChainId; // Object.entries messes the type

            const chainName = getChain({ chainId }).name;
            const { address, decimals } = assetOnNetworkOverrides;
            // filter out the asset we're selling already
            if (
              isSameAsset(assetToSell, { chainId, address }) ||
              !supportedChains[chainId]
            )
              return;
            return {
              ...assetToSell,
              isNativeAsset: isNativeAsset(address, chainId),
              chainId,
              chainName: chainName,
              uniqueId: `${address}-${chainId}`,
              address,
              decimals,
            };
          },
        )
      : []
  ).filter(Boolean);

  const crosschainExactMatches = Object.values(verifiedAssets)
    ?.map((verifiedList) => {
      return verifiedList?.filter((t) => {
        const symbolMatch = isLowerCaseMatch(t?.symbol, query);
        const nameMatch = isLowerCaseMatch(t?.name, query);
        return symbolMatch || nameMatch;
      });
    })
    .flat()
    .filter(Boolean);

  // the lists below should be filtered by favorite/bridge asset match
  const results = useMemo(() => {
    const sections: AssetToBuySection[] = [];
    if (bridge) {
      sections.push({ data: bridgeList || [], id: 'bridge' });
      return sections;
    }

    if (popularAssets?.length) {
      sections.push({ id: 'popular', data: popularAssets });
    }

    if (bridgeAsset) {
      sections.push({
        data: [bridgeAsset],
        id: 'bridge',
      });
    }
    if (favoritesList?.length) {
      sections.push({
        data: difference(favoritesList, [
          ...popularAssets,
          bridgeAsset,
          assetToSell,
        ]),
        id: 'favorites',
      });
    }

    const otherSectionsAssets = [
      ...popularAssets,
      ...favoritesList,
      bridgeAsset,
      assetToSell,
    ];

    if (query === '') {
      sections.push({
        data: difference(
          verifiedAssets[outputChainId] || [],
          otherSectionsAssets,
        ),
        id: 'verified',
      });
    } else if (enableAllNetworkTokenSearch) {
      const hasVerifiedAssets = targetAllNetworksVerifiedAssets.length > 0;

      if (hasVerifiedAssets) {
        sections.push({
          data: difference(
            targetAllNetworksVerifiedAssets,
            otherSectionsAssets,
          ),
          id: 'verified',
        });
      }

      const hasSomeUnverifiedAssets =
        targetAllNetworksUnverifiedAssets.length > 0 ||
        targetAllNetworkMetadataAssets.length > 0;

      if (hasSomeUnverifiedAssets) {
        let allUnverifiedAssets = difference(
          uniqBy(
            [
              ...targetAllNetworksUnverifiedAssets,
              ...targetAllNetworkMetadataAssets,
            ],
            'uniqueId',
          ),
          otherSectionsAssets,
        );

        if (hasVerifiedAssets) {
          allUnverifiedAssets = difference(
            allUnverifiedAssets,
            targetAllNetworksVerifiedAssets,
          );
        }

        sections.push({
          data: allUnverifiedAssets,
          id: 'unverified',
        });
      }

      return sections;
    } else {
      if (targetVerifiedAssets?.length) {
        sections.push({
          data: difference(targetVerifiedAssets, otherSectionsAssets),
          id: 'verified',
        });
      }

      if (targetUnverifiedAssets?.length && enableUnverifiedSearch) {
        sections.push({
          data: difference(targetUnverifiedAssets, otherSectionsAssets),
          id: 'unverified',
        });
      }

      if (!sections.length && crosschainExactMatches?.length) {
        sections.push({
          data: crosschainExactMatches,
          id: 'other_networks',
        });
      }
    }

    return sections;
  }, [
    bridge,
    popularAssets,
    bridgeAsset,
    favoritesList,
    assetToSell,
    query,
    enableAllNetworkTokenSearch,
    bridgeList,
    verifiedAssets,
    outputChainId,
    targetAllNetworksVerifiedAssets,
    targetAllNetworksUnverifiedAssets,
    targetAllNetworkMetadataAssets,
    targetVerifiedAssets,
    targetUnverifiedAssets,
    enableUnverifiedSearch,
    crosschainExactMatches,
  ]);

  return {
    loading,
    results,
    networkSearchStatus,
  };
}
