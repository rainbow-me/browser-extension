import { isAddress } from '@ethersproject/address';
import { uniqBy } from 'lodash';
import { rankings } from 'match-sorter';
import { useCallback, useMemo } from 'react';
import { Address } from 'viem';

import { SUPPORTED_CHAINS } from '~/core/references/chains';
import { useAssetSearchMetadataAllNetworks } from '~/core/resources/assets/assetMetadata';
import { useTokenSearch } from '~/core/resources/search';
import { useTokenDiscovery } from '~/core/resources/search/tokenDiscovery';
import { useTokenSearchAllNetworks } from '~/core/resources/search/tokenSearch';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { isSameAsset } from '~/core/utils/assets';
import { getChain, isNativeAsset } from '~/core/utils/chains';
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

  const { testnetMode } = useTestnetModeStore();

  const enableAllNetworkTokenSearch = queryIsAddress && !testnetMode && !bridge;

  const networkSearchStatus = enableAllNetworkTokenSearch
    ? AssetToBuyNetworkSearchStatus.all
    : AssetToBuyNetworkSearchStatus.single;

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

  const { data: baseVerifiedAssets, isLoading: baseVerifiedAssetsLoading } =
    useTokenSearch({
      chainId: ChainId.base,
      ...VERIFIED_ASSETS_PAYLOAD,
      fromChainId,
    });

  const { data: zoraVerifiedAssets, isLoading: zoraVerifiedAssetsLoading } =
    useTokenSearch({
      chainId: ChainId.zora,
      ...VERIFIED_ASSETS_PAYLOAD,
      fromChainId,
    });

  const {
    data: avalancheVerifiedAssets,
    isLoading: avalancheVerifiedAssetsLoading,
  } = useTokenSearch({
    chainId: ChainId.avalanche,
    ...VERIFIED_ASSETS_PAYLOAD,
    fromChainId,
  });

  const { data: blastVerifiedAssets, isLoading: blastVerifiedAssetsLoading } =
    useTokenSearch({
      chainId: ChainId.blast,
      ...VERIFIED_ASSETS_PAYLOAD,
      fromChainId,
    });

  const { data: degenVerifiedAssets, isLoading: degenVerifiedAssetsLoading } =
    useTokenSearch({
      chainId: ChainId.degen,
      ...VERIFIED_ASSETS_PAYLOAD,
      fromChainId,
    });

  const {
    data: apechainVerifiedAssets,
    isLoading: apechainVerifiedAssetsLoading,
  } = useTokenSearch({
    chainId: ChainId.apechain,
    ...VERIFIED_ASSETS_PAYLOAD,
    fromChainId,
  });

  // current search
  const { data: targetVerifiedAssets, isLoading: targetVerifiedAssetsLoading } =
    useTokenSearch(
      {
        chainId: outputChainId,
        keys,
        list: 'verifiedAssets',
        threshold,
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
      keys,
      list: 'highLiquidityAssets',
      threshold,
      query,
      fromChainId,
    },
    {
      enabled: enableUnverifiedSearch && !enableAllNetworkTokenSearch,
    },
  );

  // All verified assets from all user chains
  const { data: targetAllNetworksUnverifiedAssets } = useTokenSearchAllNetworks(
    {
      keys,
      list: 'highLiquidityAssets',
      threshold,
      query,
    },
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
    {
      keys,
      list: 'verifiedAssets',
      threshold,
      query,
    },
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

  const { data: popularAssets = [] } = useTokenDiscovery({
    chainId: outputChainId,
  });

  const { favorites } = useFavoriteAssets();

  const favoritesList = useMemo(() => {
    const favoritesByChain = favorites[outputChainId] || [];
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
      [ChainId.base]: {
        assets: baseVerifiedAssets,
        loading: baseVerifiedAssetsLoading,
      },
      [ChainId.zora]: {
        assets: zoraVerifiedAssets,
        loading: zoraVerifiedAssetsLoading,
      },
      [ChainId.avalanche]: {
        assets: avalancheVerifiedAssets,
        loading: avalancheVerifiedAssetsLoading,
      },
      [ChainId.blast]: {
        assets: blastVerifiedAssets,
        loading: blastVerifiedAssetsLoading,
      },
      [ChainId.degen]: {
        assets: degenVerifiedAssets,
        loading: degenVerifiedAssetsLoading,
      },
      [ChainId.apechain]: {
        assets: apechainVerifiedAssets,
        loading: apechainVerifiedAssetsLoading,
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
      baseVerifiedAssets,
      baseVerifiedAssetsLoading,
      zoraVerifiedAssets,
      zoraVerifiedAssetsLoading,
      avalancheVerifiedAssets,
      avalancheVerifiedAssetsLoading,
      blastVerifiedAssets,
      blastVerifiedAssetsLoading,
      degenVerifiedAssets,
      degenVerifiedAssetsLoading,
      apechainVerifiedAssets,
      apechainVerifiedAssetsLoading,
    ],
  );

  // temporarily limiting the number of assets to display
  // for performance after deprecating `isRainbowCurated`
  const getVerifiedAssets = useCallback(
    (chainId: ChainId) => verifiedAssets[chainId]?.assets,
    [verifiedAssets],
  );

  const bridgeAsset = useMemo(() => {
    const curatedAssets = getVerifiedAssets(outputChainId);
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
  }, [assetToSell, getVerifiedAssets, outputChainId, query]);

  const loading = useMemo(() => {
    return query === ''
      ? verifiedAssets[outputChainId]?.loading
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
      [ChainId.mainnet]: getVerifiedAssets(ChainId.mainnet),
      [ChainId.optimism]: getVerifiedAssets(ChainId.optimism),
      [ChainId.bsc]: getVerifiedAssets(ChainId.bsc),
      [ChainId.polygon]: getVerifiedAssets(ChainId.polygon),
      [ChainId.arbitrum]: getVerifiedAssets(ChainId.arbitrum),
      [ChainId.base]: getVerifiedAssets(ChainId.base),
      [ChainId.zora]: getVerifiedAssets(ChainId.zora),
      [ChainId.avalanche]: getVerifiedAssets(ChainId.avalanche),
      [ChainId.blast]: getVerifiedAssets(ChainId.blast),
      [ChainId.degen]: getVerifiedAssets(ChainId.degen),
      [ChainId.apechain]: getVerifiedAssets(ChainId.apechain),
    }),
    [getVerifiedAssets],
  );

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
              !SUPPORTED_CHAINS.some((n) => n.id === chainId)
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
      return verifiedList?.assets?.filter((t) => {
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
          curatedAssets[outputChainId] || [],
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
          data: difference(crosschainExactMatches, otherSectionsAssets),
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
    curatedAssets,
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
