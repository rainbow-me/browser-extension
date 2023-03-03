import {
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
} from '~/core/references';
import { useAssets } from '~/core/resources/assets';
import { useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';

export function useNativeAssets() {
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets } = useAssets({
    assetAddresses: {
      [ChainId.mainnet]: [ETH_ADDRESS],
      [ChainId.bsc]: [BNB_MAINNET_ADDRESS],
      [ChainId.polygon]: [MATIC_MAINNET_ADDRESS],
    },
    currency,
  });
  return assets;
}
