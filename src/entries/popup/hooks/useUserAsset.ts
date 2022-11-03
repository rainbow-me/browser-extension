import { useAccount } from 'wagmi';

import { createSelectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';

export function useUserAsset(uniqueId: UniqueId) {
  const { address } = useAccount();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: asset } = useUserAssets(
    {
      address,
      currency,
    },
    {
      select: createSelectUserAssetWithUniqueId(uniqueId),
    },
  );
  return asset;
}
