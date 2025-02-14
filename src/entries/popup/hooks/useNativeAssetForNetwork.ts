import { ETH_ADDRESS } from '~/core/references';
import { networkStore } from '~/core/state/networks/networks';
import { UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export const getNetworkNativeAssetUniqueId = ({
  chainId = ChainId.mainnet,
}: {
  chainId?: ChainId;
}): UniqueId => {
  const nativeAssetAddress =
    networkStore.getState().getChainsNativeAsset()[chainId]?.address ||
    ETH_ADDRESS;
  return `${nativeAssetAddress}_${chainId}`;
};
