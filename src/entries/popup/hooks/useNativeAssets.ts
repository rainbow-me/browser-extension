import { chainsNativeAsset } from '~/core/references/chains';
import { useAssets } from '~/core/resources/assets';
import { fetchAssets } from '~/core/resources/assets/assets';
import { currentCurrencyStore, useCurrentCurrencyStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';

const NATIVE_ASSETS = [
  { address: chainsNativeAsset[ChainId.mainnet], chainId: ChainId.mainnet },
  { address: chainsNativeAsset[ChainId.bsc], chainId: ChainId.bsc },
  { address: chainsNativeAsset[ChainId.polygon], chainId: ChainId.polygon },
  { address: chainsNativeAsset[ChainId.avalanche], chainId: ChainId.avalanche },
  { address: chainsNativeAsset[ChainId.degen], chainId: ChainId.degen },
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
