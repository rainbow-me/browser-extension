import { isAddress } from 'ethers/lib/utils';
import { useCallback, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useTokenSearch } from '~/core/resources/search';
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

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

export function useSearchCurrencyLists({
  inputChainId,
  outputChainId,
  searchQuery,
}: {
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
      verifiedAssets[chainId].assets?.filter((t) => t.isRainbowCurated),
    [verifiedAssets],
  );

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
    .map((verifiedList) => {
      return verifiedList.assets?.filter((t) => {
        const symbolMatch = isLowerCaseMatch(t?.symbol, query);
        const nameMatch = isLowerCaseMatch(t?.name, query);
        return symbolMatch || nameMatch;
      });
    })
    .flat()
    .filter((v) => !!v);

  // favorites/bridge asset are not currently implemented
  // the lists below should be filtered by favorite/bridge asset match
  const results = useMemo(() => {
    if (query === '') {
      const curatedSection = {
        data: curatedAssets[outputChainId],
        title: i18n.t('token_search.section_header.verified'),
        symbol: 'checkmark.seal.fill' as SymbolProps['symbol'],
        id: 'verified',
      };
      return [curatedSection];
    } else {
      const sections: {
        data: (SearchAsset | undefined)[];
        title: string;
        symbol: SymbolProps['symbol'];
        id: string;
      }[] = [];

      if (targetVerifiedAssets?.length) {
        const verifiedSection = {
          data: targetVerifiedAssets,
          title: i18n.t('token_search.section_header.verified'),
          symbol: 'checkmark.seal.fill' as SymbolProps['symbol'],
          id: 'verified',
        };
        sections.push(verifiedSection);
      }

      if (targetUnverifiedAssets?.length) {
        const unverifiedSection = {
          data: targetUnverifiedAssets,
          title: i18n.t('token_search.section_header.unverified'),
          symbol: 'exclamationmark.triangle.fill' as SymbolProps['symbol'],
          id: 'unverified',
        };
        sections.push(unverifiedSection);
      }

      if (!sections.length && crosschainExactMatches?.length) {
        const crosschainSection = {
          data: crosschainExactMatches,
          title: i18n.t('token_search.section_header.on_other_networks'),
          symbol: 'network' as SymbolProps['symbol'],
          id: 'other_networks',
        };
        sections.push(crosschainSection);
      }

      return sections;
    }
  }, [
    crosschainExactMatches,
    curatedAssets,
    outputChainId,
    query,
    targetUnverifiedAssets,
    targetVerifiedAssets,
  ]);

  return {
    loading,
    results,
  };
}
