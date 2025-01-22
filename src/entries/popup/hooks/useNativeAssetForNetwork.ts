import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';
import { UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

export const getNetworkNativeAssetUniqueId = ({
  chainId = ChainId.mainnet,
}: {
  chainId?: ChainId;
}): UniqueId =>
  `${
    useBackendNetworksStore.getState().getChainsNativeAsset()[chainId].address
  }_${chainId}` as UniqueId;
