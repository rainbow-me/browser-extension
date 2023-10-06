import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
  goerli,
  hardhat,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  zora,
  zoraTestnet,
} from '@wagmi/chains';
import { type Chain, sepolia } from 'wagmi';

import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { ChainId, ChainName, ChainNameDisplay } from '~/core/types/chains';

import { AddressOrEth } from '../types/assets';

import { isLowerCaseMatch } from './strings';

export const SUPPORTED_CHAINS: Chain[] = [
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  bsc,
  goerli,
  sepolia,
  optimismGoerli,
  bscTestnet,
  polygonMumbai,
  arbitrumGoerli,
  baseGoerli,
  zoraTestnet,
].map((chain) => ({ ...chain, name: ChainNameDisplay[chain.id] }));

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(({ id }) => id);

/**
 * @desc Checks if the given chain is a Layer 2.
 * @param chain The chain name to check.
 * @return Whether or not the chain is an L2 network.
 */
export const isL2Chain = (chain: ChainName | ChainId): boolean => {
  switch (chain) {
    case ChainName.arbitrum:
    case ChainName.base:
    case ChainName.bsc:
    case ChainName.optimism:
    case ChainName.polygon:
    case ChainName.zora:
    case ChainId.arbitrum:
    case ChainId.base:
    case ChainId.bsc:
    case ChainId.optimism:
    case ChainId.polygon:
    case ChainId.zora:
      return true;
    default:
      return false;
  }
};

export function isNativeAsset(address: AddressOrEth, chainId: ChainId) {
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
  } else if (chainId === ChainId.base) {
    return 'basescan.org';
  } else if (chainId === ChainId.zora) {
    return 'explorer.zora.energy';
  } else if (chainId === ChainId.polygon) {
    return 'polygonscan.com';
  } else if (chainId === ChainId.bsc) {
    return 'bscscan.com';
  } else if (chainId === ChainId.arbitrum) {
    return 'arbiscan.io';
  }
  return 'etherscan.io';
}

export function getNativeAssetSymbolForChain(chainId?: ChainId) {
  switch (chainId) {
    case ChainId.arbitrum:
      return arbitrum.nativeCurrency.symbol;
    case ChainId.base:
      return base.nativeCurrency.symbol;
    case ChainId.bsc:
      return bsc.nativeCurrency.symbol;
    case ChainId.goerli:
      return goerli.nativeCurrency.symbol;
    case ChainId.optimism:
      return optimism.nativeCurrency.symbol;
    case ChainId.mainnet:
      return mainnet.nativeCurrency.symbol;
    case ChainId.polygon:
      return polygon.nativeCurrency.symbol;
    case ChainId.hardhat:
      return hardhat.nativeCurrency.symbol;
  }
  return mainnet.nativeCurrency.symbol;
}

export function isSupportedChainId(chainId: number) {
  const supportedChainIds = SUPPORTED_CHAINS.map((chain) => chain.id);
  return supportedChainIds.includes(chainId);
}
