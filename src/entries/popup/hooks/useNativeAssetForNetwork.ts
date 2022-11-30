import { Address } from 'wagmi';

import {
  ARBITRUM_ETH_ADDRESS,
  BNB_BSC_ADDRESS,
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
  MATIC_POLYGON_ADDRESS,
  NATIVE_ASSETS_PER_CHAIN,
  OPTIMISM_ETH_ADDRESS,
} from '~/core/references';
import { UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId } from '~/core/utils/chains';

import { useNativeAssets } from './useNativeAssets';

const getNetworkNativeMainnetAssetAddress = ({
  chainId,
}: {
  chainId: ChainId;
}): Address => {
  switch (chainId) {
    case ChainId.arbitrum:
    case ChainId.mainnet:
    case ChainId.optimism:
      return ETH_ADDRESS as Address;
    case ChainId.bsc:
      return BNB_MAINNET_ADDRESS;
    case ChainId.polygon:
      return MATIC_MAINNET_ADDRESS;
    default:
      return ETH_ADDRESS as Address;
  }
};

const getNetworkNativeAssetUniqueId = ({
  chainId,
}: {
  chainId: ChainId;
}): UniqueId => {
  switch (chainId) {
    case ChainId.arbitrum:
      return `${ARBITRUM_ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.mainnet:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.optimism:
      return `${OPTIMISM_ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.bsc:
      return `${BNB_BSC_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.polygon:
      return `${MATIC_POLYGON_ADDRESS}_${chainId}` as UniqueId;
    default:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
  }
};

export function useNativeAssetForNetwork({ chainId }: { chainId: ChainId }) {
  const nativeAssets = useNativeAssets();
  const mainnetAddress = getNetworkNativeMainnetAssetAddress({ chainId });
  const nativeAsset = nativeAssets?.[`${mainnetAddress}_${ChainId.mainnet}`];
  return {
    ...nativeAsset,
    uniqueId: getNetworkNativeAssetUniqueId({ chainId }),
    address: NATIVE_ASSETS_PER_CHAIN[chainNameFromChainId(chainId)],
    mainnetAddress,
    isNativeAsset: true,
  };
}
