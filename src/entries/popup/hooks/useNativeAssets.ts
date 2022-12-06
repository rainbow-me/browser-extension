import {
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
} from '~/core/references';
import { useAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';

export function useNativeAssets() {
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets } = useAssets({
    assetAddresses: [BNB_MAINNET_ADDRESS, ETH_ADDRESS, MATIC_MAINNET_ADDRESS],
    currency,
  });
  return assets;
}
