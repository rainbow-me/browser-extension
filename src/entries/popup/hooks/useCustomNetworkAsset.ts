import { Address } from 'viem';

import { selectUserAssetWithUniqueId } from '~/core/resources/_selectors/assets';
import { useCustomNetworkAssets } from '~/core/resources/assets/customNetworkAssets';
import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
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
  const { currentAddress } = useCurrentAddressStore();
  const { currentCurrency: currency } = useCurrentCurrencyStore();
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
