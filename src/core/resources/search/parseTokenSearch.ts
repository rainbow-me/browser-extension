import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
import { isNativeAsset } from '~/core/utils/chains';

export function parseTokenSearch(
  asset: SearchAsset,
  chainId: ChainId,
): SearchAsset {
  const networkInfo = asset.networks[chainId];
  const mainnetInfo = asset.networks[ChainId.mainnet];

  return {
    ...asset,
    address: networkInfo ? networkInfo.address : asset.address,
    chainId,
    decimals: networkInfo ? networkInfo.decimals : asset.decimals,
    isNativeAsset: isNativeAsset(asset.address, chainId),
    mainnetAddress: mainnetInfo?.address as AddressOrEth,
    uniqueId: `${networkInfo?.address || asset.uniqueId}_${chainId}`,
  };
}
