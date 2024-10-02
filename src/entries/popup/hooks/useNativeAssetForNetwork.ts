import { chainsNativeAsset } from '~/core/references/chains';
import { UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export const getNetworkNativeAssetUniqueId = ({
  chainId = ChainId.mainnet,
}: {
  chainId?: ChainId;
}): UniqueId => `${chainsNativeAsset[chainId]}_${chainId}` as UniqueId;
