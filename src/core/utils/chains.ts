import { AddressZero } from '@ethersproject/constants';
import { getNetwork } from '@wagmi/core';
import { mainnet } from 'wagmi';

import { NATIVE_ASSETS_PER_CHAIN, SUPPORTED_CHAINS } from '~/core/references';
import { ChainId, ChainName } from '~/core/types/chains';

import { customRPCsStore } from '../state/customRPC';
import { AddressOrEth } from '../types/assets';

import { getDappHost } from './connectedApps';
import { isLowerCaseMatch } from './strings';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const customChainIdsToAssetNames: Record<ChainId, string> = {
  43114: 'avalanchex',
  100: 'xdai',
  324: 'zksync',
  1313161554: 'aurora',
  42220: 'celo',
  250: 'fantom',
  1666600000: 'harmony',
  59144: 'linea',
  25: 'cronos',
  2222: 'kavaevm',
  8217: 'klaytn',
  314: 'filecoin',
  534352: 'scroll',
};

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
  return chains.filter((chain) => !!chain.testnet);
};

export const getSupportedTestnetChainIds = () =>
  getSupportedTestnetChains()
    .filter(
      (chain) =>
        chain.id !== ChainId.hardhat && chain.id !== ChainId.hardhatOptimism,
    )
    .map((chain) => chain.id);

export const getCustomChains = () => {
  const { customChains } = customRPCsStore.getState();
  return {
    customChains: Object.values(customChains)
      .map((customChain) =>
        customChain.chains.find(
          (rpc) => rpc.rpcUrls.default.http[0] === customChain.activeRpcUrl,
        ),
      )
      .filter(Boolean),
  };
};

export const findCustomChainForChainId = (chainId: number) => {
  const { customChains } = getCustomChains();
  return customChains.find((network) => network.id === chainId);
};

export const isCustomChain = (chainId: number) =>
  !!findCustomChainForChainId(chainId);

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
  if (isCustomChain(chainId)) {
    return AddressZero === address;
  }
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
  return chain?.blockExplorers
    ? getDappHost(chain.blockExplorers.default.url)
    : undefined;
}

export function getChain({ chainId }: { chainId?: ChainId }) {
  const { chains } = getNetwork();
  const chain = chains.find((chain) => chain.id === chainId);
  return chain || { ...mainnet, testnet: false };
}

export function isTestnetChainId({ chainId }: { chainId?: ChainId }) {
  const chain = getChain({ chainId });
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
