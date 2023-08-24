import { useMemo } from 'react';

import {
  selectUserAssetsFilteringSmallBalancesList,
  selectUserAssetsList,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
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
  const { connectedToHardhat } = useConnectedToHardhatStore();
  const { hideSmallBalances } = useHideSmallBalancesStore();
  const navigate = useRainbowNavigate();

  const { data: assets = [] } = useUserAssets(
    {
      address,
      currency,
      connectedToHardhat,
    },
    {
      select: hideSmallBalances
        ? selectUserAssetsFilteringSmallBalancesList
        : selectUserAssetsList,
    },
  );

  const searchableTokens = useMemo(() => {
    return assets.map<TokenSearchItem>((asset) => ({
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
  }, [address, assets, navigate]);

  return { searchableTokens };
};
