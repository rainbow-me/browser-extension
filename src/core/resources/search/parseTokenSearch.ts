import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { isNativeAsset } from '~/core/utils/chains';
import { normalizeNativeAssetAddress } from '~/core/utils/nativeAssets';

export function parseTokenSearch(
  asset: SearchAsset,
  chainId: ChainId,
): SearchAsset {
  const networkInfo = asset.networks[chainId];
  const mainnetInfo = asset.networks[ChainId.mainnet];

  // Normalize addresses - SearchAsset should have normalized addresses, but normalize to be safe
  const address = networkInfo
    ? normalizeNativeAssetAddress(networkInfo.address) ?? asset.address
    : asset.address;
  const mainnetAddress = mainnetInfo
    ? normalizeNativeAssetAddress(mainnetInfo.address) ?? asset.mainnetAddress
    : asset.mainnetAddress;

  // Normalize addresses in networks object
  const normalizedNetworks: SearchAsset['networks'] = asset.networks
    ? Object.entries(asset.networks).reduce(
        (acc, [chainIdStr, networkData]) => {
          if (!networkData || !acc) return acc;
          const chainIdKey = +chainIdStr as ChainId;
          const normalizedNetworkAddress = normalizeNativeAssetAddress(
            networkData.address,
          );
          if (normalizedNetworkAddress) {
            acc[chainIdKey] = {
              ...networkData,
              address: normalizedNetworkAddress,
            };
          }
          return acc;
        },
        {} as NonNullable<SearchAsset['networks']>,
      )
    : {};

  return {
    ...asset,
    address,
    chainId,
    decimals: networkInfo ? networkInfo.decimals : asset.decimals,
    isNativeAsset: isNativeAsset(address, chainId),
    mainnetAddress,
    networks: normalizedNetworks,
    uniqueId: `${address}_${chainId}`,
  };
}
