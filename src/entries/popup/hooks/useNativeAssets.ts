import { chainsNativeAsset } from '~/core/references/chains';
import { useExternalTokens } from '~/core/resources/assets/externalToken';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

const NATIVE_ASSETS = [
  { address: chainsNativeAsset[ChainId.mainnet], chainId: ChainId.mainnet },
  { address: chainsNativeAsset[ChainId.bsc], chainId: ChainId.bsc },
  { address: chainsNativeAsset[ChainId.polygon], chainId: ChainId.polygon },
  { address: chainsNativeAsset[ChainId.avalanche], chainId: ChainId.avalanche },
  { address: chainsNativeAsset[ChainId.degen], chainId: ChainId.degen },
];

export function useNativeAssets() {
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const response = useExternalTokens({
    assets: NATIVE_ASSETS,
    currency,
  });
  return response
    .map((asset) => (asset.data ? asset.data : null))
    .filter(Boolean)
    .reduce(
      (acc, asset) => {
        acc[asset.chainId] = asset;
        return acc;
      },
      {} as Record<ChainId, ParsedAsset>,
    );
}
