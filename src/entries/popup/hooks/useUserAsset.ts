import { Address } from 'viem';

import { selectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { UniqueId } from '~/core/types/assets';

export function useUserAsset(uniqueId?: UniqueId, address?: Address) {
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  return useUserAssets(
    {
      address: address || currentAddress,
      currency,
    },
    {
      select: uniqueId ? selectUserAssetWithUniqueId(uniqueId) : undefined,
      enabled: !!uniqueId,
    },
  );
}
