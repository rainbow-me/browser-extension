import { Address } from 'viem';

import { selectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useUserAssets } from '~/core/resources/assets';
import { useSettingsStore } from '~/core/state/currentSettings/store';
import { UniqueId } from '~/core/types/assets';

export function useUserAsset(uniqueId?: UniqueId, address?: Address) {
  const [currentAddress] = useSettingsStore('currentAddress');
  const [currency] = useSettingsStore('currentCurrency');
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
