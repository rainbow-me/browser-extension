import { AddressZero } from '@ethersproject/constants';
import { Chain, mainnet } from 'viem/chains';
import { useConfig } from 'wagmi';

import { ChainId } from '~/core/types/chains';

import { useBackendNetworksStore } from '../state/backendNetworks/backendNetworks';
import { AddressOrEth } from '../types/assets';
import { wagmiConfig } from '../wagmi';

import { getDappHost } from './connectedApps';
import { findRainbowChainForChainId } from './rainbowChains';
import { isLowerCaseMatch } from './strings';

// Main chains for chain settings

const getMainChainsHelper = (chains: readonly [Chain, ...Chain[]]) => {
  const mainnetChains = useBackendNetworksStore
    .getState()
    .getSupportedMainnetChains();
  const allSupportedChainIds = useBackendNetworksStore
    .getState()
    .getSupportedChainIds();
  // The chain ID of all the mainnets we support
  const supportedChainIds = new Set(mainnetChains.map((chain) => chain.id));

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
        !allSupportedChainIds.some((chainId) => chainId === chain.id)),
  );

  return mainnetChains.concat(customChainsIncludingTestnets);
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

// Chain helpers

export function getChain({ chainId }: { chainId?: ChainId }) {
  const { chains } = wagmiConfig;
  const chain = chains.find((chain) => chain.id === chainId);
  return chain || { ...mainnet, testnet: false };
}

export const isCustomChain = (chainId: number) =>
  !useBackendNetworksStore
    .getState()
    .getSupportedChainIds()
    .includes(chainId) && !!findRainbowChainForChainId(chainId);

export function isNativeAsset(address: AddressOrEth, chainId: ChainId) {
  if (isCustomChain(chainId)) {
    return AddressZero === address;
  }

  const nativeAsset = useBackendNetworksStore.getState().getChainsNativeAsset()[
    chainId
  ];
  return isLowerCaseMatch(nativeAsset.address, address);
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
