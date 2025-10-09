import { useMemo } from 'react';

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

const getPlatformAmountValue = (asset: ParsedUserAsset) =>
  parseFloat(asset.platformValue?.amount || asset.native.balance.amount || '0');

export const useVisibleTokenCount = () => {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { hideSmallBalances } = useHideSmallBalancesStore();

  const { data: assets = [] } = useUserAssets(
    {
      address,
      currency: currentCurrency,
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
      address: address,
      currency: currentCurrency,
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

  const allAssets = useMemo(
    () =>
      combinedAssets.sort(
        (a: ParsedUserAsset, b: ParsedUserAsset) =>
          getPlatformAmountValue(b) - getPlatformAmountValue(a),
      ),
    [combinedAssets],
  );

  const visibleTokenCount = useMemo(
    () => allAssets.length || 0,
    [allAssets.length],
  );

  return { visibleTokenCount };
};
