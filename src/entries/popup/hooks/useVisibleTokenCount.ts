import sortedUniqBy from 'lodash/sortedUniqBy';
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

  const allAssets = useMemo(
    () =>
      sortedUniqBy(
        [...assets, ...customNetworkAssets].sort(
          (a: ParsedUserAsset, b: ParsedUserAsset) =>
            parseFloat(b?.native?.balance?.amount) -
            parseFloat(a?.native?.balance?.amount),
        ),
        'uniqueId',
      ),
    [assets, customNetworkAssets],
  );

  const visibleTokenCount = useMemo(
    () => allAssets.length || 0,
    [allAssets.length],
  );

  return { visibleTokenCount };
};
