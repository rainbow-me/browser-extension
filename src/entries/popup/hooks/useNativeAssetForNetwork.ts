import { ETH_ADDRESS, NATIVE_ASSET_ADDRESS } from '~/core/references';
import { useNetworkStore } from '~/core/state/networks/networks';
import { UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { normalizeNativeAssetAddress } from '~/core/utils/nativeAssets';

export const getNetworkNativeAssetUniqueId = ({
  chainId = ChainId.mainnet,
}: {
  chainId?: ChainId;
}): UniqueId => {
  const rawNativeAssetAddress =
    useNetworkStore.getState().getChainsNativeAsset()[chainId]?.address ||
    ETH_ADDRESS;
  // Normalize to ensure we match the stored asset format (NATIVE_ASSET_ADDRESS)
  const normalizedAddress =
    normalizeNativeAssetAddress(rawNativeAssetAddress) ?? NATIVE_ASSET_ADDRESS;
  return `${normalizedAddress}_${chainId}`;
};
