import { Address } from 'viem';

import {
  AVAX_AVALANCHE_ADDRESS,
  BNB_BSC_ADDRESS,
  DEGEN_DEGEN_ADDRESS,
  ETH_ADDRESS,
  MATIC_POLYGON_ADDRESS,
} from '~/core/references';
import { useAssets } from '~/core/resources/assets';
import { fetchAssets } from '~/core/resources/assets/assets';
import { currentCurrencyStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';

const NATIVE_ASSETS = [
  { address: ETH_ADDRESS as Address, chainId: ChainId.mainnet },
  { address: BNB_BSC_ADDRESS as Address, chainId: ChainId.bsc },
  { address: MATIC_POLYGON_ADDRESS as Address, chainId: ChainId.polygon },
  { address: AVAX_AVALANCHE_ADDRESS as Address, chainId: ChainId.avalanche },
  { address: DEGEN_DEGEN_ADDRESS as Address, chainId: ChainId.degen },
];
export async function getNativeAssets() {
  const { currentCurrency } = currentCurrencyStore.getState();
  const assets = await fetchAssets({
    assets: NATIVE_ASSETS,
    currency: currentCurrency,
  });
  return assets;
}

export function useNativeAssets() {
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const { data: assets } = useAssets({
    assets: NATIVE_ASSETS,
    currency,
  });
  return assets;
}
