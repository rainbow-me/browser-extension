import { useAccount } from 'wagmi';

import { selectUserAssetsBalance } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';

export function useUserAssetsBalance() {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: totalAssetsBalance } = useUserAssets(
    {
      address,
      currency,
    },
    {
      select: selectUserAssetsBalance(),
    },
  );

  return {
    amount: totalAssetsBalance,
    display: convertAmountToNativeDisplay(totalAssetsBalance || 0, currency),
  };
}
