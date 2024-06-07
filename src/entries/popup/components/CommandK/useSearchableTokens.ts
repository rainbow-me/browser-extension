import { useMemo } from 'react';
import { Address } from 'viem';

import {
  selectUserAssetsFilteringSmallBalancesList,
  selectUserAssetsList,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useTokenSearchAllNetworks } from '~/core/resources/search/tokenSearch';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { ParsedUserAsset } from '~/core/types/assets';
import {
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import {
  SearchItemType,
  TokenSearchItem,
  UnownedTokenSearchItem,
} from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

const VERIFIED_ASSETS_PAYLOAD: {
  keys: TokenSearchAssetKey[];
  list: TokenSearchListId;
  threshold: TokenSearchThreshold;
} = {
  keys: ['symbol', 'name'],
  list: 'verifiedAssets',
  threshold: 'CONTAINS',
};

export const useSearchableTokens = (searchQuery: string) => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { hideSmallBalances } = useHideSmallBalancesStore();
  const navigate = useRainbowNavigate();

  const { data: searchedAssets, isFetching: isFetchingSearchedAssets } =
    useTokenSearchAllNetworks({
      ...VERIFIED_ASSETS_PAYLOAD,
      query: searchQuery,
    });

  const { data: userAssets = [], isFetching: isFetchingUserAssets } =
    useUserAssets(
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

  const {
    data: customNetworkAssets = [],
    isFetching: isFetchingCustomNetworkAssets,
  } = useCustomNetworkAssets(
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
    return searchedAssets
      .map<UnownedTokenSearchItem>((asset) => ({
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
        searchTags: [asset.address],
        tokenSymbol: asset.symbol,
        type: SearchItemType.UnownedToken,
      }))
      .filter((searchedToken) => {
        const hasToken = ownedSearchableTokens.some((ownedToken) => {
          return isLowerCaseMatch(searchedToken.address, ownedToken.address);
        });

        return !hasToken;
      });
  }, [navigate, ownedSearchableTokens, searchedAssets]);

  const combinedSearchableTokens = useMemo(
    () => [...ownedSearchableTokens, ...unownedSearchableTokens],
    [ownedSearchableTokens, unownedSearchableTokens],
  );

  return {
    data: combinedSearchableTokens,
    isFetching:
      isFetchingSearchedAssets ||
      isFetchingUserAssets ||
      isFetchingCustomNetworkAssets,
  };
};
