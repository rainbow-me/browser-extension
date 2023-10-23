import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  zora,
  zoraTestnet,
} from '@wagmi/chains';
import { getNetwork } from '@wagmi/core';
import { type Chain, sepolia } from 'wagmi';

import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { ChainId, ChainName, ChainNameDisplay } from '~/core/types/chains';

import { AddressOrEth } from '../types/assets';

import { getDappHost } from './connectedApps';
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

export const getSupportedChainsWithHardhat = () => {
  const { chains } = getNetwork();
  return chains.filter(
    (chain) =>
      !chain.testnet ||
      (process.env.IS_TESTING === 'true' &&
        (chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism)),
  );
};

export const getSupportedChains = () => {
  const { chains } = getNetwork();
  return chains.filter((chain) => !chain.testnet);
};

export const getSupportedChainIds = () =>
  getSupportedChains().map((chain) => chain.id);

export const getSupportedTestnetChains = () => {
  const { chains } = getNetwork();
  return chains.filter((chain) => chain.testnet);
};

export const getSupportedTestnetChainIds = () =>
  getSupportedTestnetChains()
    .filter(
      (chain) =>
        chain.id !== ChainId.hardhat && chain.id !== ChainId.hardhatOptimism,
    )
    .map((chain) => chain.id);

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
  const chain = getChain({ chainId });
  if (chain && chain.blockExplorers?.default.url) {
    return getDappHost(chain.blockExplorers.default.url);
  }
  return 'etherscan.io';
}

export function getChain({ chainId }: { chainId?: ChainId }) {
  const { chains } = getNetwork();
  const chain = chains.find((chain) => chain.id === chainId);
  return chain || { ...mainnet, testnet: false };
}

export function isTestnetChainId({ chainId }: { chainId?: ChainId }) {
  const chain = getChain({ chainId });
  console.log('-- chain', chainId, chain);
  return !!chain.testnet;
}

export function isSupportedChainId(chainId: number) {
  return SUPPORTED_CHAINS.map((chain) => chain.id).includes(chainId);
}

export const chainIdToUse = (
  connectedToHardhat: boolean,
  connectedToHardhatOp: boolean,
  activeSessionChainId?: number | null,
) => {
  if (connectedToHardhat) {
    return ChainId.hardhat;
  }
  if (connectedToHardhatOp) {
    return ChainId.hardhatOptimism;
  }
  if (activeSessionChainId !== null && activeSessionChainId !== undefined) {
    return activeSessionChainId;
  } else {
    return ChainId.mainnet;
  }
};
