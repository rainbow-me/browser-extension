import { Address } from 'viem';

import { selectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useSettingsStore } from '~/core/state/currentSettings/store';
import { UniqueId } from '~/core/types/assets';

export function useCustomNetworkAsset({
  address,
  uniqueId,
  filterZeroBalance,
}: {
  address?: Address;
  uniqueId?: UniqueId;
  filterZeroBalance?: boolean;
}) {
  const [currentAddress] = useSettingsStore('currentAddress');
  const [currency] = useSettingsStore('currentCurrency');
  return useCustomNetworkAssets(
    {
      address: address || currentAddress,
      currency,
      filterZeroBalance,
    },
    {
      select: uniqueId ? selectUserAssetWithUniqueId(uniqueId) : undefined,
      enabled: !!uniqueId,
    },
  );
}
