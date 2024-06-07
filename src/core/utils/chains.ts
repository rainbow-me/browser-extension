import { AddressZero } from '@ethersproject/constants';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Chain, mainnet } from 'viem/chains';
import { useConfig } from 'wagmi';

import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { ChainId } from '~/core/types/chains';

import { proxyRpcEndpoint } from '../providers';
import {
  SUPPORTED_CHAINS,
  SUPPORTED_MAINNET_CHAINS,
} from '../references/chains';
import { RAINBOW_CHAINS_SUPPORTED } from '../state/rainbowChains';
import { AddressOrEth } from '../types/assets';
import { wagmiConfig } from '../wagmi';

import { getDappHost, isValidUrl } from './connectedApps';
import { findRainbowChainForChainId } from './rainbowChains';
import { isLowerCaseMatch } from './strings';

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

export const getSupportedChainsWithHardhat = () => {
  const { chains } = wagmiConfig;
  return chains.filter(
    (chain) =>
      !chain.testnet ||
      (process.env.IS_TESTING === 'true' &&
        (chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism)),
  );
};

export const getSupportedChains = () => {
  const { chains } = wagmiConfig;
  return chains.filter((chain) => !chain.testnet);
};

export const getSupportedChainIds = () =>
  getSupportedChains().map((chain) => chain.id);

export const getSupportedTestnetChains = () => {
  const { chains } = wagmiConfig;
  return chains.filter((chain) => !!chain.testnet);
};

export const useBackendSupportedChains = ({
  testnetMode,
}: {
  testnetMode?: boolean;
}) => {
  const { chains } = useConfig();
  return chains.filter((chain) =>
    testnetMode ? !!chain.testnet : !chain.testnet,
  );
};

export const getBackendSupportedChains = ({
  testnetMode,
}: {
  testnetMode?: boolean;
}) => {
  const { chains } = wagmiConfig;
  return chains.filter((chain) =>
    testnetMode ? !!chain.testnet : !chain.testnet,
  );
};

export const isCustomChain = (chainId: number) =>
  !RAINBOW_CHAINS_SUPPORTED.map((chain) => chain.id).includes(chainId) &&
  !!findRainbowChainForChainId(chainId);

export function isNativeAsset(address: AddressOrEth, chainId: ChainId) {
  if (isCustomChain(chainId)) {
    return AddressZero === address;
  }
  return isLowerCaseMatch(NATIVE_ASSETS_PER_CHAIN[chainId], address);
}

export function getBlockExplorerHostForChain(chainId: ChainId) {
  const chain = getChain({ chainId });
  return chain?.blockExplorers
    ? getDappHost(chain.blockExplorers.default.url)
    : undefined;
}

export function getChain({ chainId }: { chainId?: ChainId }) {
  const { chains } = wagmiConfig;
  const chain = chains.find((chain) => chain.id === chainId);
  return chain || { ...mainnet, testnet: false };
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

export const getChainMetadataRPCUrl = async ({
  rpcUrl,
}: {
  rpcUrl?: string;
}) => {
  if (rpcUrl && isValidUrl(rpcUrl)) {
    const provider = new JsonRpcProvider(proxyRpcEndpoint(rpcUrl, 0));
    const network = await provider.getNetwork();
    return { chainId: network.chainId };
  }
  return null;
};
