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
import { LocalStorage } from '../storage';
import { ChainId, hardhat, hardhatOptimism } from '../types/chains';
import { SUPPORTED_CHAINS } from '../utils/chains';
import { findCustomNetworkForChainId } from '../utils/customNetworks';

const IS_TESTING = process.env.IS_TESTING === 'true';

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

const getOriginalRpcEndpoint = (chain: Chain) => {
  // overrides have preference
  const userAddedNetwork = findCustomNetworkForChainId(chain.id);
  if (userAddedNetwork) {
    return { http: userAddedNetwork.rpc };
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
    case ChainId['optimism-goerli']:
      return { http: process.env.OPTIMISM_GOERLI_RPC as string };
    case ChainId['bsc-testnet']:
      return { http: process.env.BSC_TESTNET_RPC as string };
    case ChainId['polygon-mumbai']:
      return { http: process.env.POLYGON_MUMBAI_RPC as string };
    case ChainId['arbitrum-goerli']:
      return { http: process.env.ARBITRUM_GOERLI_RPC as string };
    case ChainId['base-goerli']:
      return { http: process.env.BASE_GOERLI_RPC as string };
    case ChainId['zora-testnet']:
      return { http: process.env.ZORA_GOERLI_RPC as string };
    default:
      return null;
  }
};

const { chains, provider, webSocketProvider } = configureChains(
  IS_TESTING
    ? SUPPORTED_CHAINS.concat(hardhat, hardhatOptimism)
    : SUPPORTED_CHAINS,
  [
    jsonRpcProvider({
      rpc: (chain) => {
        const originalRpcEndpoint = getOriginalRpcEndpoint(chain);
        if (originalRpcEndpoint) {
          return { http: proxyRpcEndpoint(originalRpcEndpoint.http, chain.id) };
        }
        return null;
      },
    }),
  ],
);

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
}: {
  autoConnect?: CreateClientConfig['autoConnect'];
  connectors?: (opts: { chains: Chain[] }) => CreateClientConfig['connectors'];
  persist?: boolean;
} = {}) {
  return createClient({
    autoConnect,
    connectors: connectors ? connectors({ chains }) : undefined,
    persister: persist ? asyncStoragePersister : undefined,
    provider,
    // Passing `undefined` will use wagmi's default storage (window.localStorage).
    // If `persist` is falsy, we want to pass through a noopStorage.
    storage: persist ? undefined : createStorage({ storage: noopStorage }),
    queryClient,
    webSocketProvider,
  });
}
