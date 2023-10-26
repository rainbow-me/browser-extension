import { useMemo } from 'react';

import {
  selectUserAssetsFilteringSmallBalancesList,
  selectUserAssetsList,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';

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

  const visibleTokenCount = useMemo(() => assets.length || 0, [assets.length]);

  return { visibleTokenCount };
};
