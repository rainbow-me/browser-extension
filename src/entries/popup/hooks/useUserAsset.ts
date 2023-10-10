import { useAccount } from 'wagmi';

import { selectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';

export function useUserAsset(uniqueId?: UniqueId) {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  return useUserAssets(
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
