import { isAddress } from '@ethersproject/address';
import { uniqBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import { Address } from 'viem';

import {
  selectUserAssetsFilteringSmallBalancesList,
  selectUserAssetsList,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useAssetSearchMetadataAllNetworks } from '~/core/resources/assets/assetMetadata';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useTokenSearchAllNetworks } from '~/core/resources/search/tokenSearch';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ParsedUserAsset } from '~/core/types/assets';
import { TokenSearchAssetKey, TokenSearchThreshold } from '~/core/types/search';
import { isENSAddressFormat } from '~/core/utils/ethereum';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useDebounce } from '../../hooks/useDebounce';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import {
  SearchItemType,
  TokenSearchItem,
  UnownedTokenSearchItem,
} from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { actionLabels } from './references';

interface UseSearchableTokensParameters {
  searchQuery: string;
  currentPage: CommandKPage;
  setSelectedCommandNeedsUpdate: (selectedCommandNeedsUpdate: boolean) => void;
}

export const useSearchableTokens = ({
  searchQuery,
  currentPage,
  setSelectedCommandNeedsUpdate,
}: UseSearchableTokensParameters) => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { hideSmallBalances } = useHideSmallBalancesStore();
  const navigate = useRainbowNavigate();
  const { testnetMode } = useTestnetModeStore();

  const query = searchQuery.toLowerCase();

  const debouncedSearchQuery = useDebounce(query, 250);

  const enableAssetSearch =
    currentPage === PAGES.HOME &&
    debouncedSearchQuery.trim().length > 2 &&
    !isENSAddressFormat(debouncedSearchQuery) &&
    !testnetMode;

  const queryIsAddress = useMemo(
    () => isAddress(debouncedSearchQuery),
    [debouncedSearchQuery],
  );

  const keys: TokenSearchAssetKey[] = useMemo(
    () => (queryIsAddress ? ['address'] : ['name', 'symbol']),
    [queryIsAddress],
  );

  const threshold: TokenSearchThreshold = useMemo(
    () => (queryIsAddress ? 'CASE_SENSITIVE_EQUAL' : 'CONTAINS'),
    [queryIsAddress],
  );

  const enableSearchChainAssets = isAddress(query) && !testnetMode;

  // All on chain searched assets from all user chains
  const {
    data: searchedChainAssets,
    isFetching: isFetchingSearchAssetMetadata,
  } = useAssetSearchMetadataAllNetworks(
    {
      assetAddress: query as Address,
    },
    {
      select: (data) => {
        if (!enableSearchChainAssets) return null;
        return data;
      },
      enabled: enableSearchChainAssets,
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );

  const {
    data: verifiedSearchAssets,
    isFetching: isFetchingVerifiedSearchedAssets,
  } = useTokenSearchAllNetworks(
    {
      list: 'verifiedAssets',
      keys,
      threshold,
      query: debouncedSearchQuery,
    },
    {
      select: (data) => {
        if (!enableAssetSearch) return [];
        return data;
      },
      enabled: enableAssetSearch,
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );

  const {
    data: unverifiedSearchAssets,
    isFetching: isFetchingUnverifiedSearchedAssets,
  } = useTokenSearchAllNetworks(
    {
      list: 'highLiquidityAssets',
      keys,
      threshold,
      query: debouncedSearchQuery,
    },
    {
      select: (data) => {
        if (!enableAssetSearch) return [];
        return data;
      },
      enabled: enableAssetSearch,
      staleTime: 10 * 60 * 1_000, // 10 min
    },
  );

  const allSearchedAssets = useMemo(
    () => [
      ...verifiedSearchAssets.map((asset) => ({
        status: 'verified' as UnownedTokenSearchItem['status'],
        ...asset,
      })),
      ...unverifiedSearchAssets.map((asset) => ({
        status: 'unverified' as UnownedTokenSearchItem['status'],
        ...asset,
      })),
      ...searchedChainAssets.map((asset) => ({
        status: 'unverified' as UnownedTokenSearchItem['status'],
        ...asset,
      })),
    ],
    [verifiedSearchAssets, unverifiedSearchAssets, searchedChainAssets],
  );

  const { data: userAssets = [] } = useUserAssets(
    {
      address,
      currency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({
          data,
          selector: hideSmallBalances
            ? selectUserAssetsFilteringSmallBalancesList
            : selectUserAssetsList,
        }),
    },
  );

  const { data: customNetworkAssets = [] } = useCustomNetworkAssets(
    {
      address: address as Address,
      currency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({
          data,
          selector: hideSmallBalances
            ? selectUserAssetsFilteringSmallBalancesList
            : selectUserAssetsList,
        }),
    },
  );

  const combinedAssets = useMemo(
    () =>
      Array.from(
        new Map(
          [...customNetworkAssets, ...userAssets].map((item) => [
            item.uniqueId,
            item,
          ]),
        ).values(),
      ),
    [userAssets, customNetworkAssets],
  );

  const ownedSearchableTokens = useMemo(() => {
    return combinedAssets.map<TokenSearchItem>((asset) => ({
      address: asset.address,
      action: () => navigate(ROUTES.TOKEN_DETAILS(asset.uniqueId)),
      actionLabel: actionLabels.open,
      actionPage: PAGES.TOKEN_DETAIL,
      asset: asset as ParsedUserAsset,
      id: asset.uniqueId,
      name: asset.name,
      nativeTokenBalance: asset.native.balance.display,
      network: asset.chainName,
      page: PAGES.MY_TOKENS,
      price: asset.price,
      searchTags: [asset.symbol, asset.chainName, asset.address],
      selectedWalletAddress: address,
      tokenBalanceAmount: asset.balance.amount,
      tokenBalanceDisplay: asset.balance.display,
      tokenSymbol: asset.symbol,
      type: SearchItemType.Token,
    }));
  }, [address, combinedAssets, navigate]);

  const unownedSearchableTokens = useMemo(() => {
    return uniqBy(allSearchedAssets, 'uniqueId')
      .map<UnownedTokenSearchItem>((asset) => ({
        status: asset.status,
        address: asset.address,
        action: () =>
          navigate(
            `${ROUTES.TOKEN_DETAILS(asset.address)}?chainId=${asset.chainId}`,
          ),
        actionLabel: actionLabels.open,
        actionPage: PAGES.UNOWNED_TOKEN_DETAIL,
        asset,
        id: asset.uniqueId,
        name: asset.name,
        network: asset.chainId,
        searchTags: [asset.symbol, asset.address],
        tokenSymbol: asset.symbol,
        type: SearchItemType.UnownedToken,
      }))
      .filter((searchedToken) => {
        const hasAsset = ownedSearchableTokens.some((ownedToken) => {
          return isLowerCaseMatch(searchedToken.address, ownedToken.address);
        });

        return !hasAsset;
      });
  }, [navigate, allSearchedAssets, ownedSearchableTokens]);

  const combinedSearchableTokens = useMemo(
    () => [...ownedSearchableTokens, ...unownedSearchableTokens],
    [ownedSearchableTokens, unownedSearchableTokens],
  );

  useEffect(() => {
    // If a user searches for a token the first result is automatically chosen.
    if (unownedSearchableTokens.length > 0 && enableAssetSearch) {
      setSelectedCommandNeedsUpdate(true);
    }
  }, [
    unownedSearchableTokens.length,
    enableAssetSearch,
    setSelectedCommandNeedsUpdate,
  ]);

  return {
    data: combinedSearchableTokens,
    isFetchingSearchAssets:
      isFetchingVerifiedSearchedAssets ||
      isFetchingUnverifiedSearchedAssets ||
      isFetchingSearchAssetMetadata,
  };
};
