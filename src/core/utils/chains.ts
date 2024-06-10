import { AddressZero } from '@ethersproject/constants';
import { Chain, mainnet } from 'viem/chains';
import { useConfig } from 'wagmi';

import { ChainId } from '~/core/types/chains';

import {
  SUPPORTED_CHAINS,
  SUPPORTED_MAINNET_CHAINS,
  chainsNativeAsset,
} from '../references/chains';
import { AddressOrEth } from '../types/assets';
import { wagmiConfig } from '../wagmi';

import { getDappHost } from './connectedApps';
import { findRainbowChainForChainId } from './rainbowChains';
import { isLowerCaseMatch } from './strings';

// Main chains for chain settings

const getMainChainsHelper = (chains: readonly [Chain, ...Chain[]]) => {
  // All the mainnets we support
  const mainSupportedChains = SUPPORTED_MAINNET_CHAINS.filter(
    (chain) => !chain.testnet,
  );
  // The chain ID of all the mainnets we support
  const supportedChainIds = new Set(
    mainSupportedChains.map((chain) => chain.id),
  );

  // All the chains that the user added
  const customMainChains = chains?.filter(
    (chain) =>
      !supportedChainIds.has(chain.id) &&
      !(chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism),
  );

  const customChainsIncludingTestnets = customMainChains.filter(
    (chain) =>
      !chain.testnet ||
      (chain.testnet &&
        !supportedChainIds.has(chain.id) &&
        !SUPPORTED_CHAINS.some(
          (supportedChain) => supportedChain.id === chain.id,
        )),
  );

  return mainSupportedChains.concat(customChainsIncludingTestnets);
};

export const useMainChains = () => {
  const { chains } = useConfig();
  return getMainChainsHelper(chains);
};

export const getMainChains = () => {
  const { chains } = wagmiConfig;
  return getMainChainsHelper(chains);
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
  !SUPPORTED_CHAINS.map((chain) => chain.id).includes(chainId) &&
  !!findRainbowChainForChainId(chainId);

export function isNativeAsset(address: AddressOrEth, chainId: ChainId) {
  if (isCustomChain(chainId)) {
    return AddressZero === address;
  }
  return isLowerCaseMatch(chainsNativeAsset[chainId], address);
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
