import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  Chain,
  CreateClientConfig,
  configureChains,
  createClient,
  createStorage,
} from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { proxyRpcEndpoint } from '../providers';
import { queryClient } from '../react-query';
import { SUPPORTED_CHAINS } from '../references';
import { LocalStorage } from '../storage';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { findCustomChainForChainId } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

const getOriginalRpcEndpoint = (chain: Chain) => {
  // overrides have preference
  const userAddedNetwork = findCustomChainForChainId(chain.id);
  if (userAddedNetwork) {
    return { http: userAddedNetwork.rpcUrls.default.http[0] };
  }

  switch (chain.id) {
    case ChainId.hardhat:
      return { http: chain.rpcUrls.default.http[0] };
    case ChainId.hardhatOptimism:
      return { http: chain.rpcUrls.default.http[0] };
    case ChainId.mainnet:
      return { http: process.env.ETH_MAINNET_RPC as string };
    case ChainId.optimism:
      return { http: process.env.OPTIMISM_MAINNET_RPC as string };
    case ChainId.arbitrum:
      return { http: process.env.ARBITRUM_MAINNET_RPC as string };
    case ChainId.polygon:
      return { http: process.env.POLYGON_MAINNET_RPC as string };
    case ChainId.base:
      return { http: process.env.BASE_MAINNET_RPC as string };
    case ChainId.zora:
      return { http: process.env.ZORA_MAINNET_RPC as string };
    case ChainId.bsc:
      return { http: process.env.BSC_MAINNET_RPC as string };
    case ChainId.goerli:
      return { http: process.env.ETH_GOERLI_RPC as string };
    case ChainId.sepolia:
      return { http: process.env.ETH_SEPOLIA_RPC as string };
    case ChainId.holesky:
      return { http: process.env.ETH_HOLESKY_RPC as string };
    case ChainId.optimismGoerli:
      return { http: process.env.OPTIMISM_GOERLI_RPC as string };
    case ChainId.optimismSepolia:
      return { http: process.env.OPTIMISM_SEPOLIA_RPC as string };
    case ChainId.bscTestnet:
      return { http: process.env.BSC_TESTNET_RPC as string };
    case ChainId.polygonMumbai:
      return { http: process.env.POLYGON_MUMBAI_RPC as string };
    case ChainId.arbitrumSepolia:
      return { http: process.env.ARBITRUM_SEPOLIA_RPC as string };
    case ChainId.arbitrumGoerli:
      return { http: process.env.ARBITRUM_GOERLI_RPC as string };
    case ChainId.baseGoerli:
      return { http: process.env.BASE_GOERLI_RPC as string };
    case ChainId.zoraTestnet:
      return { http: process.env.ZORA_GOERLI_RPC as string };
    default:
      return null;
  }
};

const supportedChains = IS_TESTING
  ? SUPPORTED_CHAINS.concat(chainHardhat, chainHardhatOptimism)
  : SUPPORTED_CHAINS;

export const configureChainsForWagmiClient = (
  chains: Chain[],
  useProxy?: boolean,
) =>
  configureChains(chains, [
    jsonRpcProvider({
      rpc: (chain) => {
        const originalRpcEndpoint = getOriginalRpcEndpoint(chain);
        if (originalRpcEndpoint) {
          return {
            http: useProxy
              ? proxyRpcEndpoint(originalRpcEndpoint.http, chain.id)
              : originalRpcEndpoint.http,
          };
        }
        return null;
      },
    }),
  ]);

const asyncStoragePersister = createAsyncStoragePersister({
  key: 'rainbow.wagmi',
  storage: {
    getItem: LocalStorage.get,
    setItem: LocalStorage.set,
    removeItem: LocalStorage.remove,
  },
});

export function createWagmiClient({
  autoConnect,
  connectors,
  persist,
  customChains,
  useProxy,
}: {
  autoConnect?: CreateClientConfig['autoConnect'];
  connectors?: (opts: { chains: Chain[] }) => CreateClientConfig['connectors'];
  persist?: boolean;
  customChains?: Chain[];
  useProxy?: boolean;
} = {}) {
  const customChainIds = customChains?.map((chain) => chain.id);
  const activeSupportedChains = supportedChains?.filter(
    (supportedChain) => !customChainIds?.includes(supportedChain.id),
  );
  const { chains, provider, webSocketProvider } = configureChainsForWagmiClient(
    activeSupportedChains.concat(customChains || []),
    useProxy,
  );

  return createClient({
    autoConnect,
    connectors: connectors
      ? connectors({
          chains,
        })
      : undefined,
    persister: persist ? asyncStoragePersister : undefined,
    provider,
    // Passing `undefined` will use wagmi's default storage (window.localStorage).
    // If `persist` is falsy, we want to pass through a noopStorage.
    storage: persist ? undefined : createStorage({ storage: noopStorage }),
    queryClient,
    webSocketProvider,
  });
}
