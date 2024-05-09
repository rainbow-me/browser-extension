import { useMemo } from 'react';
import { Address } from 'viem';

import {
  selectUserAssetsFilteringSmallBalancesList,
  selectUserAssetsList,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useTokensSearch } from '~/core/resources/search/tokenSearch';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { ParsedUserAsset } from '~/core/types/assets';

import {
  TokenSearchAssetKey,
  TokenSearchListId,
  TokenSearchThreshold,
} from '~/core/types/search';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { SearchItemType, TokenSearchItem } from './SearchItems';
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

  const tokensSearch = useTokensSearch({
    ...VERIFIED_ASSETS_PAYLOAD,
    query: searchQuery,
  });

  console.log('tokensSearch', tokensSearch);
  const { data: assets = [] } = useUserAssets(
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
          [...customNetworkAssets, ...assets].map((item) => [
            item.uniqueId,
            item,
          ]),
        ).values(),
      ),
    [assets, customNetworkAssets],
  );

  const searchableTokens = useMemo(() => {
    return combinedAssets.map<TokenSearchItem>((asset) => ({
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
      searchTags: [asset.symbol, asset.chainName],
      selectedWalletAddress: address,
      tokenBalanceAmount: asset.balance.amount,
      tokenBalanceDisplay: asset.balance.display,
      tokenSymbol: asset.symbol,
      type: SearchItemType.Token,
    }));
  }, [address, combinedAssets, navigate]);

  return { searchableTokens };
};
