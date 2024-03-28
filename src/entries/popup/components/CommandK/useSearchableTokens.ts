import { useMemo } from 'react';
import { Address } from 'viem';

import {
  selectUserAssetsFilteringSmallBalancesList,
  selectUserAssetsList,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { ParsedUserAsset } from '~/core/types/assets';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { SearchItemType, TokenSearchItem } from './SearchItems';
import { PAGES } from './pageConfig';
import { actionLabels } from './references';

export const useSearchableTokens = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { hideSmallBalances } = useHideSmallBalancesStore();
  const navigate = useRainbowNavigate();

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

  const searchableTokens = useMemo(() => {
    return [...assets, ...customNetworkAssets].map<TokenSearchItem>(
      (asset) => ({
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
      }),
    );
  }, [address, assets, customNetworkAssets, navigate]);

  return { searchableTokens };
};
