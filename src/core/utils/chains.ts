import { AddressZero } from '@ethersproject/constants';
import { Chain, mainnet } from 'viem/chains';
import { useConfig } from 'wagmi';

import { networkStore } from '~/core/state/networks/networks';
import { mergedChainToViemChain } from '~/core/state/networks/utils';
import { ChainId, MergedChain } from '~/core/types/chains';

import { AddressOrEth } from '../types/assets';
import { wagmiConfig } from '../wagmi';

import { getDappHost } from './connectedApps';
import { findRainbowChainForChainId } from './rainbowChains';
import { isLowerCaseMatch } from './strings';

// Main chains for chain settings
const getMainChainsHelper = (
  chains: readonly [Chain, ...Chain[]],
  backendSupportedChains: Record<number, MergedChain>,
) => {
  // All the mainnets we support
  const mainnetChains = Object.values(backendSupportedChains).reduce(
    (acc, chain) => {
      if (!chain.testnet) {
        acc[chain.id] = chain;
      }
      return acc;
    },
    {} as Record<number, MergedChain>,
  );

  const customMainChains = chains?.filter(
    (chain) =>
      !mainnetChains[chain.id] &&
      !(chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism),
  );

  const customChainsIncludingTestnets = customMainChains.filter(
    (chain) =>
      !chain.testnet ||
      (chain.testnet &&
        !mainnetChains[chain.id] &&
        !backendSupportedChains[chain.id]),
  );

  return Object.values(mainnetChains)
    .map(mergedChainToViemChain)
    .concat(customChainsIncludingTestnets);
};

export const useMainChains = () => {
  const { chains } = useConfig();
  const backendSupportedChains = networkStore((state) =>
    state.getSupportedChains(true),
  );
  return getMainChainsHelper(chains, backendSupportedChains);
};

export const getMainChains = () => {
  const { chains } = wagmiConfig;
  return getMainChainsHelper(
    chains,
    networkStore.getState().getSupportedChains(true),
  );
};

// All the chains we support
// rainbow default and custom chains

export const useSupportedChains = ({ testnets }: { testnets?: boolean }) => {
  const { chains } = useConfig();
  return chains.filter((chain) =>
    testnets ? !!chain.testnet : !chain.testnet,
  );
};

export const getSupportedChains = ({ testnets }: { testnets?: boolean }) => {
  const { chains } = wagmiConfig;
  return chains.filter((chain) =>
    testnets
      ? !!chain.testnet
      : !chain.testnet ||
        (process.env.IS_TESTING === 'true' &&
          (chain.id === ChainId.hardhat ||
            chain.id === ChainId.hardhatOptimism)),
  );
};

// Chain helpers

export function getChain({ chainId }: { chainId?: ChainId }) {
  const { chains } = wagmiConfig;
  const chain = chains.find((chain) => chain.id === chainId);
  return chain || { ...mainnet, testnet: false };
}

export const isCustomChain = (chainId: number) =>
  !networkStore.getState().getSupportedChains()[chainId] &&
  !!findRainbowChainForChainId(chainId);

export function isNativeAsset(address: AddressOrEth, chainId: ChainId) {
  if (isCustomChain(chainId)) {
    return AddressZero === address;
  }

  return isLowerCaseMatch(
    networkStore.getState().getNetworksNativeAsset()[chainId].address,
    address,
  );
}

export function getBlockExplorerHostForChain(chainId: ChainId) {
  const chain = getChain({ chainId });
  return chain?.blockExplorers
    ? getDappHost(chain.blockExplorers.default.url)
    : undefined;
}

export const chainIdToUse = (
  connectedToHardhat: boolean,
  connectedToHardhatOp: boolean,
  activeSessionChainId: number,
) => {
  if (connectedToHardhat) {
    return ChainId.hardhat;
  }
  if (connectedToHardhatOp) {
    return ChainId.hardhatOptimism;
  }
  return activeSessionChainId;
};
