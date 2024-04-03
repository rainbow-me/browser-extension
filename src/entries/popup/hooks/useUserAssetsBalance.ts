import { useCallback } from 'react';
import { Address } from 'wagmi';

import {
  selectUserAssetsBalance,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { ParsedUserAsset } from '~/core/types/assets';
import { add, convertAmountToNativeDisplay } from '~/core/utils/numbers';

export function useUserAssetsBalance() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { hiddenAssets } = useHiddenAssetStore();
  const isHidden = useCallback(
    (asset: ParsedUserAsset) =>
      hiddenAssets.some(
        (uniqueId) => uniqueId === computeUniqueIdForHiddenAsset(asset),
      ),
    [hiddenAssets],
  );

  const { data: totalAssetsBalanceKnownNetworks } = useUserAssets(
    {
      address,
      currency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({
          data,
          selector: (assetsByChain) => {
            return selectUserAssetsBalance(assetsByChain, isHidden);
          },
        }),
    },
  );

  const { data: totalAssetsBalanceCustomNetworks = [] } =
    useCustomNetworkAssets(
      {
        address: address as Address,
        currency,
      },
      {
        select: (data) =>
          selectorFilterByUserChains({
            data,
            selector: (assetsByChain) => {
              return selectUserAssetsBalance(assetsByChain, isHidden);
            },
          }),
      },
    );

  const totalAssetsBalance = add(
    totalAssetsBalanceKnownNetworks as string,
    totalAssetsBalanceCustomNetworks as string,
  );

  return {
    amount: totalAssetsBalance,
    display: convertAmountToNativeDisplay(totalAssetsBalance || 0, currency),
  };
}
