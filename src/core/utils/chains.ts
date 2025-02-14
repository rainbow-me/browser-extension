import { AddressZero } from '@ethersproject/constants';
import { Chain, mainnet } from 'viem/chains';
import { useConfig } from 'wagmi';

import { networkStore } from '~/core/state/networks/networks';
import { mergedChainToViemChain } from '~/core/state/networks/utils';
import { ChainId, TransformedChain } from '~/core/types/chains';

import { AddressOrEth } from '../types/assets';
import { wagmiConfig } from '../wagmi';

import { getDappHost } from './connectedApps';
import { isLowerCaseMatch } from './strings';

// Main chains for chain settings
const getMainChainsHelper = (
  chains: readonly [Chain, ...Chain[]],
  allSupportedChains: Record<number, TransformedChain>,
) => {
  const allMainnetSupportedChainsOrCustomChains = Object.values(
    allSupportedChains,
  ).filter(
    (chain) =>
      (!chain.testnet && chain.type === 'supported') || chain.type === 'custom',
  );

  const allCustomWagmiChains = chains.filter(
    (c) =>
      !c.testnet &&
      !allMainnetSupportedChainsOrCustomChains.find((c2) => c2.id === c.id),
  );

  return allMainnetSupportedChainsOrCustomChains
    .map(mergedChainToViemChain)
    .concat(allCustomWagmiChains);
};

export const useMainChains = () => {
  const { chains } = useConfig();
  const allSupportedChains = networkStore((state) => state.getAllChains(true));

  return getMainChainsHelper(chains, allSupportedChains);
};

export const getMainChains = () => {
  const { chains } = wagmiConfig;
  return getMainChainsHelper(
    chains,
    networkStore.getState().getBackendSupportedChains(true),
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
  !networkStore.getState().getBackendSupportedChains(true)[chainId] &&
  !!networkStore.getState().getActiveRpcForChain(chainId);

export function isNativeAsset(address: AddressOrEth, chainId: ChainId) {
  if (isCustomChain(chainId)) {
    return AddressZero === address;
  }

  return isLowerCaseMatch(
    networkStore.getState().getChainsNativeAsset()[chainId]?.address,
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
