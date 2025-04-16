import { useExternalTokens } from '~/core/resources/assets/externalToken';
import { useCurrentCurrencyStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { AddressOrEth, ParsedAsset } from '~/core/types/assets';
import { BackendNetwork, ChainId } from '~/core/types/chains';

export function useNativeAssets() {
  const { currentCurrency: currency } = useCurrentCurrencyStore();
  const nativeAssets = useNetworkStore((state) => state.getChainsNativeAsset());

  // NOTE: We only fetch the native asset for mainnet and chains that don't use ETH as their native token
  const { chainsToFetch, ethNativeChains } = Object.entries(
    nativeAssets,
  ).reduce<{
    chainsToFetch: Record<number, BackendNetwork['nativeAsset']>;
    ethNativeChains: number[];
  }>(
    (acc, [chainId, nativeAsset]) => {
      if (
        +chainId === ChainId.mainnet ||
        nativeAsset.symbol.toLowerCase() !== 'eth'
      ) {
        acc.chainsToFetch[+chainId] = nativeAsset;
      } else {
        acc.ethNativeChains.push(+chainId);
      }
      return acc;
    },
    { chainsToFetch: {}, ethNativeChains: [] },
  );

  const NATIVE_ASSETS = Object.entries(chainsToFetch).map(
    ([chainId, nativeAsset]) => ({
      address: nativeAsset.address as AddressOrEth,
      chainId: +chainId,
    }),
  );

  const response = useExternalTokens({
    assets: NATIVE_ASSETS,
    currency,
  });
  return response
    .map((asset) => (asset.data ? asset.data : null))
    .filter(Boolean)
    .reduce(
      (acc, asset) => {
        if (
          asset.chainId === ChainId.mainnet ||
          asset.symbol.toLowerCase() === 'eth'
        ) {
          // since we only performed one fetch we need to add the eth price
          // to the chains that are eth native
          ethNativeChains.forEach((chainId) => {
            acc[chainId] = asset;
          });
        } else {
          acc[asset.chainId] = asset;
        }
        return acc;
      },
      {} as Record<ChainId, ParsedAsset>,
    );
}
