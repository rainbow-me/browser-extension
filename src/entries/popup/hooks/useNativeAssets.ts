import { Address } from 'wagmi';

import {
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
} from '~/core/references';
import { useAssets } from '~/core/resources/assets';
import { fetchAssets } from '~/core/resources/assets/assets';
import { currentCurrencyStore, useCurrentCurrencyStore } from '~/core/state';

export async function getNativeAssets() {
  const { currentCurrency } = currentCurrencyStore.getState();
  const assets = await fetchAssets({
    assetAddresses: [
      ETH_ADDRESS as Address,
      BNB_MAINNET_ADDRESS,
      MATIC_MAINNET_ADDRESS,
    ],
    currency: currentCurrency,
  });
  return assets;
}

export function useNativeAssets() {
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets } = useAssets({
    assetAddresses: [
      ETH_ADDRESS as Address,
      BNB_MAINNET_ADDRESS,
      MATIC_MAINNET_ADDRESS,
    ],
    currency,
  });
  return assets;
}
