import { Chain, chain } from 'wagmi';

import {
  ARBITRUM_ETH_ADDRESS,
  ETH_ADDRESS,
  MATIC_POLYGON_ADDRESS,
  OPTIMISM_ETH_ADDRESS,
} from '~/core/references';
import { UniqueId } from '~/core/types/assets';

import { useUserAsset } from './useUserAsset';

const getNetworkNativeAssetUniqueId = ({
  chainId,
}: {
  chainId: Chain['id'];
}): UniqueId => {
  switch (chainId) {
    case chain.arbitrum.id:
      return `${ARBITRUM_ETH_ADDRESS}_${chainId}` as UniqueId;
    case chain.optimism.id:
      return `${OPTIMISM_ETH_ADDRESS}_${chainId}` as UniqueId;
    case chain.polygon.id:
      return `${MATIC_POLYGON_ADDRESS}_${chainId}` as UniqueId;
    default:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
  }
};

export function useNativeAssetForNetwork({
  chainId,
}: {
  chainId: Chain['id'];
}) {
  const uniqueId = getNetworkNativeAssetUniqueId({ chainId });
  const nativeAsset = useUserAsset(uniqueId);
  return nativeAsset;
}
