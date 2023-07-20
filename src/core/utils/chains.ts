import { arbitrum, bsc, mainnet, optimism, polygon } from '@wagmi/chains';
import type { Address, Chain } from 'wagmi';

import { ETH_ADDRESS, NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { ChainId, ChainName } from '~/core/types/chains';

import { isLowerCaseMatch } from './strings';

export const SUPPORTED_CHAINS: Chain[] = [
  mainnet,
  polygon,
  optimism,
  { ...arbitrum, name: 'Arbitrum' },
  bsc,
];

/**
 * @desc Checks if the given chain is a Layer 2.
 * @param chain The chain name to check.
 * @return Whether or not the chain is an L2 network.
 */
export const isL2Chain = (chain: ChainName | ChainId): boolean => {
  switch (chain) {
    case ChainName.arbitrum:
    case ChainName.bsc:
    case ChainName.optimism:
    case ChainName.polygon:
    case ChainId.arbitrum:
    case ChainId.bsc:
    case ChainId.optimism:
    case ChainId.polygon:
      return true;
    default:
      return false;
  }
};

export function isNativeAsset(
  address: Address | typeof ETH_ADDRESS,
  chainId: ChainId,
) {
  return isLowerCaseMatch(NATIVE_ASSETS_PER_CHAIN[chainId], address);
}

export function chainIdFromChainName(chainName: ChainName) {
  return ChainId[chainName];
}

export function chainNameFromChainId(chainId: ChainId) {
  return Object.keys(ChainId)[
    Object.values(ChainId).indexOf(chainId)
  ] as ChainName;
}

export function getBlockExplorerHostForChain(chainId: ChainId) {
  if (chainId === ChainId.optimism) {
    return 'optimistic.etherscan.io';
  } else if (chainId === ChainId.polygon) {
    return 'polygonscan.com';
  } else if (chainId === ChainId.bsc) {
    return 'bscscan.com';
  } else if (chainId === ChainId.arbitrum) {
    return 'arbiscan.io';
  }
  return 'etherscan.io';
}

export function isSupportedChainId(chainId: number) {
  const supportedChainIds = SUPPORTED_CHAINS.map((chain) => chain.id);
  return supportedChainIds.includes(chainId);
}
