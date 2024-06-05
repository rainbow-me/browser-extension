import { AddressZero } from '@ethersproject/constants';
import { Address } from 'viem';

import {
  AVAX_AVALANCHE_ADDRESS,
  BNB_BSC_ADDRESS,
  DEGEN_DEGEN_ADDRESS,
  ETH_ADDRESS,
  MATIC_POLYGON_ADDRESS,
} from '~/core/references';
import { nativeAssetChains } from '~/core/references/chains';
import { ParsedAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainName, chainIdToNameMapping } from '~/core/types/chains';

import { getNativeAssets, useNativeAssets } from './useNativeAssets';

export const getNetworkNativeAssetChainId = ({
  chainId,
}: {
  chainId: ChainId;
}):
  | ChainId.mainnet
  | ChainId.polygon
  | ChainId.avalanche
  | ChainId.degen
  | ChainId.bsc => {
  switch (chainId) {
    case ChainId.avalanche:
      return ChainId.avalanche;
    case ChainId.bsc:
      return ChainId.bsc;
    case ChainId.polygon:
      return ChainId.polygon;
    case ChainId.degen:
      return ChainId.degen;
    case ChainId.arbitrum:
    case ChainId.mainnet:
    case ChainId.optimism:
    case ChainId.base:
    case ChainId.zora:
    case ChainId.blast:
    default:
      return ChainId.mainnet;
  }
};

export const getNetworkNativeAssetUniqueId = ({
  chainId,
}: {
  chainId: ChainId;
}): UniqueId => {
  switch (chainId) {
    case ChainId.mainnet:
      return `${ETH_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.arbitrum:
    case ChainId.base:
    case ChainId.optimism:
    case ChainId.zora:
    case ChainId.avalanche:
      return `${AVAX_AVALANCHE_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.degen:
      return `${DEGEN_DEGEN_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.bsc:
      return `${BNB_BSC_ADDRESS}_${chainId}` as UniqueId;
    case ChainId.polygon:
      return `${MATIC_POLYGON_ADDRESS}_${chainId}` as UniqueId;
    default:
      return `${AddressZero}_${chainId}` as UniqueId;
  }
};

export async function getNativeAssetForNetwork({
  chainId,
}: {
  chainId: ChainId;
}) {
  const nativeAssets = await getNativeAssets();
  const nativeAssetMetadataChainId = getNetworkNativeAssetChainId({ chainId });
  const nativeAsset = nativeAssets?.[nativeAssetMetadataChainId];
  if (nativeAsset) {
    return {
      ...nativeAsset,
      chainId: chainId || nativeAsset?.chainId || ChainId.mainnet,
      chainName:
        chainIdToNameMapping[chainId] ||
        nativeAsset?.chainName ||
        ChainName.mainnet,
      uniqueId: getNetworkNativeAssetUniqueId({ chainId }),
      address: nativeAssetChains[chainId] as Address,
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
  const nativeAssetMetadataChainId = getNetworkNativeAssetChainId({ chainId });
  const nativeAsset = nativeAssets?.[nativeAssetMetadataChainId];
  if (nativeAsset) {
    return {
      ...nativeAsset,
      chainId: nativeAsset?.chainId || ChainId.mainnet,
      chainName: nativeAsset?.chainName || ChainName.mainnet,
      uniqueId: getNetworkNativeAssetUniqueId({ chainId }),
      address: nativeAssetChains[chainId] as Address,
      isNativeAsset: true,
    };
  }
  return undefined;
}
