import { AddressZero } from '@ethersproject/constants';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  Chain,
  celo,
  fantom,
  harmonyOne,
  mainnet,
  moonbeam,
} from 'viem/chains';
import { useConfig } from 'wagmi';

import {
  NATIVE_ASSETS_PER_CHAIN,
  SUPPORTED_CHAINS,
  SUPPORTED_CHAIN_IDS,
  SUPPORTED_MAINNET_CHAINS,
} from '~/core/references';
import {
  ChainId,
  ChainName,
  ChainNameDisplay,
  chainIdToNameMapping,
  chainNameToIdMapping,
} from '~/core/types/chains';

import { proxyRpcEndpoint } from '../providers';
import { RAINBOW_CHAINS_SUPPORTED } from '../state/rainbowChains';
import { AddressOrEth } from '../types/assets';
import { wagmiConfig } from '../wagmi';

import { getDappHost, isValidUrl } from './connectedApps';
import { findRainbowChainForChainId } from './rainbowChains';
import { isLowerCaseMatch } from './strings';

export const customChainIdsToAssetNames: Record<ChainId, string> = {
  42170: 'arbitrumnova',
  1313161554: 'aurora',
  43114: 'avalanchex',
  81457: 'blast',
  168587773: 'blastsepolia',
  288: 'boba',
  42220: 'celo',
  61: 'classic',
  25: 'cronos',
  666666666: 'degen',
  2000: 'dogechain',
  250: 'fantom',
  314: 'filecoin',
  1666600000: 'harmony',
  13371: 'immutablezkevm',
  2222: 'kavaevm',
  8217: 'klaytn',
  59144: 'linea',
  957: 'lyra',
  169: 'manta',
  5000: 'mantle',
  1088: 'metis',
  34443: 'mode',
  1284: 'moonbeam',
  7700: 'nativecanto',
  204: 'opbnb',
  11297108109: 'palm',
  424: 'pgn',
  1101: 'polygonzkevm',
  369: 'pulsechain',
  1380012617: 'rari',
  1918988905: 'raritestnet',
  690: 'redstone',
  17069: 'redstonegarnet',
  17001: 'redstoneholesky',
  30: 'rootstock',
  31: 'rootstocktestnet',
  534352: 'scroll',
  100: 'xdai',
  324: 'zksync',
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

export const isDefaultSupportedChain = ({ chainId }: { chainId: ChainId }) =>
  SUPPORTED_CHAIN_IDS.map((id) => id).includes(chainId);

export const getSupportedChains = () => {
  const { chains } = wagmiConfig;
  return chains.filter((chain) => !chain.testnet);
};

export const useMainChains = () => {
  const { chains } = useConfig();
  // All the mainnets we support
  const mainSupportedChains = SUPPORTED_MAINNET_CHAINS.filter(
    (chain) => !chain.testnet,
  );

  // The chain ID of all the mainnets we support
  const supportedChainIds = mainSupportedChains.map((chain) => chain.id);

  // All the chains that the user added
  const customMainChains = chains?.filter(
    (chain) =>
      !supportedChainIds.includes(chain.id) &&
      !(chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism),
  );

  const customChainsIncludingTestnets = customMainChains.filter(
    (chain: Chain) =>
      !chain.testnet ||
      (chain.testnet &&
        !mainSupportedChains
          .map((chain: Chain) => chain.id)
          .includes(chain.id) &&
        !SUPPORTED_CHAINS.map((chain) => chain.id).includes(chain.id)),
  );

  return mainSupportedChains.concat(customChainsIncludingTestnets);
};

export const getMainChains = () => {
  const { chains } = wagmiConfig;
  // All the mainnets we support
  const mainSupportedChains = SUPPORTED_MAINNET_CHAINS.filter(
    (chain) => !chain.testnet,
  );

  // The chain ID of all the mainnets we support
  const supportedChainIds = mainSupportedChains.map((chain) => chain.id);

  // All the chains that the user added
  const customMainChains = chains?.filter(
    (chain) =>
      !supportedChainIds.includes(chain.id) &&
      !(chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism),
  );

  const customChainsIncludingTestnets = customMainChains.filter(
    (chain: Chain) =>
      !chain.testnet ||
      (chain.testnet &&
        !mainSupportedChains
          .map((chain: Chain) => chain.id)
          .includes(chain.id) &&
        !SUPPORTED_CHAINS.map((chain) => chain.id).includes(chain.id)),
  );

  return mainSupportedChains.concat(customChainsIncludingTestnets);
};

export const getSupportedChainIds = () =>
  getSupportedChains().map((chain) => chain.id);

export const getSupportedTestnetChains = () => {
  const { chains } = wagmiConfig;
  return chains.filter((chain) => !!chain.testnet);
};

export const getSimpleHashSupportedChainNames = () => {
  return [
    'ethereum',
    ChainName.polygon,
    ChainName.arbitrum,
    ChainName.arbitrumNova,
    ChainName.avalanche,
    ChainName.base,
    ChainName.blast,
    ChainName.bsc,
    ChainName.celo,
    ChainName.gnosis,
    ChainName.linea,
    ChainName.manta,
    ChainName.optimism,
    ChainName.polygonZkEvm,
    ChainName.rari,
    ChainName.scroll,
    ChainName.zora,
  ] as (ChainName | 'ethereum' | 'ethereum-sepolia')[];
};

export const getSimpleHashSupportedTestnetChainNames = () => {
  return [
    'ethereum-sepolia',
    ChainName.arbitrumSepolia,
    ChainName.baseSepolia,
    ChainName.blastSepolia,
    ChainName.optimismSepolia,
    ChainName.zoraSepolia,
    ChainName.polygonAmoy,
  ] as (ChainName | 'ethereum-sepolia' | 'ethereum')[];
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

export const getChainName = ({ chainId }: { chainId: number }) => {
  const chain = getChain({ chainId });
  return ChainNameDisplay[chainId] || chain.name;
};

export const isCustomChain = (chainId: number) =>
  !RAINBOW_CHAINS_SUPPORTED.map((chain) => chain.id).includes(chainId) &&
  !!findRainbowChainForChainId(chainId);

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
    case ChainName.avalanche:
    case ChainId.arbitrum:
    case ChainId.base:
    case ChainId.bsc:
    case ChainId.optimism:
    case ChainId.polygon:
    case ChainId.zora:
    case ChainId.avalanche:
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
  return chainNameToIdMapping[chainName];
}

export function chainNameFromChainId(chainId: ChainId): ChainName {
  return chainIdToNameMapping[chainId];
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

export const deriveChainIdByHostname = (hostname: string) => {
  switch (hostname) {
    case 'etherscan.io':
      return ChainId.mainnet;
    case 'arbiscan.io':
      return ChainId.arbitrum;
    case 'amoy.polygonscan.com':
    case 'oklink.com/amoy':
      return ChainId.polygonAmoy;
    case 'polygonscan.com':
      return ChainId.polygon;
    case 'optimistic.etherscan.io':
      return ChainId.optimism;
    case 'bscscan.com':
      return ChainId.bsc;
    case 'ftmscan.com':
      return fantom.id;
    case 'explorer.celo.org':
      return celo.id;
    case 'explorer.harmony.one':
      return harmonyOne.id;
    case 'explorer.avax.network':
    case 'subnets.avax.network':
    case 'snowtrace.io':
      return ChainId.avalanche;
    case 'subnets-test.avax.network':
    case 'testnet.snowtrace.io':
      return ChainId.avalancheFuji;
    case 'moonscan.io':
      return moonbeam.id;
    case 'explorer.holesky.redstone.xyz':
      return 17001;
    case 'blastscan.io':
      return ChainId.blast;
    case 'testnet.blastscan.io':
      return 168587773;
    default:
      return ChainId.mainnet;
  }
};
