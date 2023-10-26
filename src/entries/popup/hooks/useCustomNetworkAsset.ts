import { useAccount } from 'wagmi';

import { selectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';

export function useCustomNetworkAsset(uniqueId?: UniqueId) {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  return useCustomNetworkAssets(
    {
      address,
      currency,
    },
    {
      select: uniqueId ? selectUserAssetWithUniqueId(uniqueId) : undefined,
      enabled: !!uniqueId,
    },
  );
}
