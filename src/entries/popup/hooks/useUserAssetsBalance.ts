import { type Address } from 'viem';

import {
  selectUserAssetsBalance,
  selectorFilterByUserChains,
} from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { add, convertAmountToNativeDisplay } from '~/core/utils/numbers';

export function useUserAssetsBalance() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: totalAssetsBalanceKnownNetworks } = useUserAssets(
    {
      address,
      currency,
    },
    {
      select: (data) =>
        selectorFilterByUserChains({ data, selector: selectUserAssetsBalance }),
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
            selector: selectUserAssetsBalance,
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
