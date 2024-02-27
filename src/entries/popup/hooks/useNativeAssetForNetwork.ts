import { Address } from 'wagmi';

import {
  AVAX_AVALANCHE_ADDRESS,
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
  NATIVE_ASSETS_PER_CHAIN,
} from '~/core/references';
import { ParsedAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { chainNameFromChainId } from '~/core/utils/chains';

import { getNativeAssets, useNativeAssets } from './useNativeAssets';

const getNetworkNativeMainnetAssetAddress = ({
  chainId,
}: {
  chainId: ChainId;
}): Address => {
  switch (chainId) {
    case ChainId.arbitrum:
    case ChainId.mainnet:
    case ChainId.optimism:
    case ChainId.base:
    case ChainId.zora:
      return ETH_ADDRESS as Address;
    case ChainId.bsc:
      return BNB_MAINNET_ADDRESS;
    case ChainId.polygon:
      return MATIC_MAINNET_ADDRESS;
    case ChainId.avalanche:
      return AVAX_AVALANCHE_ADDRESS;
    default:
      return ETH_ADDRESS as Address;
  }
};

export const getNetworkNativeAssetUniqueId = ({
  chainId,
}: {
  chainId: ChainId;
}): UniqueId => {
  switch (chainId) {
    case ChainId.arbitrum:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.mainnet:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.optimism:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.base:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.zora:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.avalanche:
      return `${AVAX_AVALANCHE_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.bsc:
      return `${BNB_MAINNET_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.polygon:
      return `${MATIC_MAINNET_ADDRESS}_${chainId}` as UniqueId;
    default:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
  }
};

export async function getNativeAssetForNetwork({
  chainId,
}: {
  chainId: ChainId;
}) {
  const nativeAssets = await getNativeAssets();
  const mainnetAddress = getNetworkNativeMainnetAssetAddress({ chainId });
  const nativeAsset = nativeAssets?.[`${mainnetAddress}_${ChainId.mainnet}`];
  if (nativeAsset) {
    return {
      ...nativeAsset,
      chainId: chainId || nativeAsset?.chainId || ChainId.mainnet,
      chainName:
        chainNameFromChainId(chainId) ||
        nativeAsset?.chainName ||
        ChainName.mainnet,
      uniqueId: getNetworkNativeAssetUniqueId({ chainId }),
      address: NATIVE_ASSETS_PER_CHAIN[chainId] as Address,
      mainnetAddress,
      isNativeAsset: true,
    };
  }
  return undefined;
}

export function useNativeAssetForNetwork({
  chainId,
}: {
  chainId: ChainId;
}): ParsedAsset | undefined {
  const nativeAssets = useNativeAssets();
  const mainnetAddress = getNetworkNativeMainnetAssetAddress({ chainId });
  const nativeAsset = nativeAssets?.[`${mainnetAddress}_${ChainId.mainnet}`];
  if (nativeAsset) {
    return {
      ...nativeAsset,
      chainId: nativeAsset?.chainId || ChainId.mainnet,
      chainName: nativeAsset?.chainName || ChainName.mainnet,
      uniqueId: getNetworkNativeAssetUniqueId({ chainId }),
      address: NATIVE_ASSETS_PER_CHAIN[chainId] as Address,
      mainnetAddress,
      isNativeAsset: true,
    };
  }
  return undefined;
}
