import { Address } from 'viem';
import {
  type Chain,
  avalancheFuji,
  curtis,
  gnosisChiado,
  inkSepolia,
} from 'viem/chains';

import backendNetworks from 'static/data/networks.json';

import { AddressOrEth } from '../types/assets';
import {
  BackendNetwork,
  BackendNetworkServices,
  ChainId,
  chainHardhat,
  chainHardhatOptimism,
} from '../types/chains';
import { transformBackendNetworksToChains } from '../utils/backendNetworks';

const IS_TESTING = process.env.IS_TESTING === 'true';

const BACKEND_CHAINS = transformBackendNetworksToChains(
  backendNetworks.networks,
);

const LOCAL_CHAINS: Chain[] = [avalancheFuji, curtis, inkSepolia, gnosisChiado];

const DEFAULT_PRIVATE_MEMPOOL_TIMEOUT = 2 * 60 * 1_000; // 2 minutes

export const SUPPORTED_CHAINS: Chain[] = IS_TESTING
  ? [...BACKEND_CHAINS, ...LOCAL_CHAINS, chainHardhat, chainHardhatOptimism]
  : BACKEND_CHAINS.concat(LOCAL_CHAINS);

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export const SUPPORTED_MAINNET_CHAINS: Chain[] = SUPPORTED_CHAINS.filter(
  (chain) => !chain.testnet,
);

export const needsL1SecurityFeeChains = backendNetworks.networks
  .filter((backendNetwork: BackendNetwork) => backendNetwork.opStack)
  .map((backendNetwork: BackendNetwork) => parseInt(backendNetwork.id, 10));

export const chainsNativeAsset: Record<number, AddressOrEth> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] = backendNetwork.nativeAsset
        .address as Address;
      return acc;
    },
    {} as Record<number, AddressOrEth>,
  );

export const chainsLabel: Record<number, string> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] = backendNetwork.label;
      return acc;
    },
    {
      [ChainId.avalancheFuji]: 'Avalanche Fuji',
      [ChainId.apechainCurtis]: 'Apechain Curtis',
      [ChainId.inkSepolia]: 'Ink Sepolia',
      [ChainId.sankoTestnet]: 'Sanko Testnet',
      [ChainId.gnosisChiado]: 'Gnosis Chiado',
    } as Record<number, string>,
  );

export const chainsPrivateMempoolTimeout: Record<number, number> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] =
        backendNetwork.privateMempoolTimeout || DEFAULT_PRIVATE_MEMPOOL_TIMEOUT;
      return acc;
    },
    {} as Record<number, number>,
  );

export const chainsName: Record<number, string> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] = backendNetwork.name;
      return acc;
    },
    {
      [ChainId.avalancheFuji]: 'avalanche-fuji',
      [ChainId.apechainCurtis]: 'apechain-curtis',
      [ChainId.inkSepolia]: 'ink-sepolia',
      [ChainId.sankoTestnet]: 'sanko-testnet',
      [ChainId.gnosisChiado]: 'gnosis-chiado',
    } as Record<number, string>,
  );

const filterChainIdsByService = (
  servicePath: (services: BackendNetworkServices) => boolean,
): number[] => {
  return backendNetworks.networks
    .filter((network: BackendNetwork) => {
      const services = network?.enabledServices;
      return services && servicePath(services);
    })
    .map((network: BackendNetwork) => parseInt(network.id, 10));
};

export const meteorologySupportedChainIds = filterChainIdsByService(
  (services) => services.meteorology.enabled,
);

export const supportedSwapChainIds = filterChainIdsByService(
  (services) => services.swap.enabled,
);

export const supportedApprovalsChainIds = filterChainIdsByService(
  (services) => services.addys.approvals,
);

export const supportedTransactionsChainIds = filterChainIdsByService(
  (services) => services.addys.transactions,
);

export const supportedAssetsChainIds = filterChainIdsByService(
  (services) => services.addys.assets,
);

export const supportedPositionsChainIds = filterChainIdsByService(
  (services) => services.addys.positions,
);

export const supportedTokenSearchChainIds = filterChainIdsByService(
  (services) => services.tokenSearch.enabled,
);

export const supportedNftChainIds = filterChainIdsByService(
  (services) => services.nftProxy.enabled,
);

export const oldDefaultRPC: { [key in ChainId]?: string } = {
  [ChainId.mainnet]: process.env.ETH_MAINNET_RPC,
  [ChainId.optimism]: process.env.OPTIMISM_MAINNET_RPC,
  [ChainId.arbitrum]: process.env.ARBITRUM_MAINNET_RPC,
  [ChainId.polygon]: process.env.POLYGON_MAINNET_RPC,
  [ChainId.base]: process.env.BASE_MAINNET_RPC,
  [ChainId.zora]: process.env.ZORA_MAINNET_RPC,
  [ChainId.bsc]: process.env.BSC_MAINNET_RPC,
  [ChainId.sepolia]: process.env.ETH_SEPOLIA_RPC,
  [ChainId.holesky]: process.env.ETH_HOLESKY_RPC,
  [ChainId.optimismSepolia]: process.env.OPTIMISM_SEPOLIA_RPC,
  [ChainId.bscTestnet]: process.env.BSC_TESTNET_RPC,
  [ChainId.arbitrumSepolia]: process.env.ARBITRUM_SEPOLIA_RPC,
  [ChainId.baseSepolia]: process.env.BASE_SEPOLIA_RPC,
  [ChainId.zoraSepolia]: process.env.ZORA_SEPOLIA_RPC,
  [ChainId.avalanche]: process.env.AVALANCHE_MAINNET_RPC,
  [ChainId.avalancheFuji]: process.env.AVALANCHE_FUJI_RPC,
  [ChainId.blast]: process.env.BLAST_MAINNET_RPC,
  [ChainId.blastSepolia]: process.env.BLAST_SEPOLIA_RPC,
  [ChainId.polygonAmoy]: process.env.POLYGON_AMOY_RPC,
  [ChainId.degen]: process.env.DEGEN_MAINNET_RPC,
};

const chainsGasUnits = backendNetworks.networks.reduce(
  (acc, backendNetwork: BackendNetwork) => {
    acc[parseInt(backendNetwork.id, 10)] = backendNetwork.gasUnits;
    return acc;
  },
  {} as Record<number, BackendNetwork['gasUnits']>,
);

export const getChainGasUnits = (chainId?: number) => {
  return (
    (chainId ? chainsGasUnits[chainId] : undefined) ||
    chainsGasUnits[ChainId.mainnet]
  );
};
