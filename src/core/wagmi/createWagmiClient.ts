import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  arbitrumGoerli,
  baseGoerli,
  bscTestnet,
  optimismGoerli,
  polygonMumbai,
  zoraTestnet,
} from '@wagmi/chains';
import {
  Chain,
  CreateClientConfig,
  configureChains,
  createClient,
  createStorage,
  goerli,
  sepolia,
} from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { queryClient } from '../react-query';
import { Storage } from '../storage';
import { ChainId, hardhat } from '../types/chains';
import { SUPPORTED_CHAINS } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

const { chains, provider, webSocketProvider } = configureChains(
  IS_TESTING ? SUPPORTED_CHAINS.concat(hardhat) : SUPPORTED_CHAINS,
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain.id) {
          case ChainId.hardhat:
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
            return { http: goerli.rpcUrls.alchemy.http[0] };
          case ChainId.sepolia:
            return { http: sepolia.rpcUrls.alchemy.http[0] };
          case ChainId.optimismGoerli:
            return { http: optimismGoerli.rpcUrls.default.http[0] };
          case ChainId.bscTestnet:
            return { http: bscTestnet.rpcUrls.default.http[0] };
          case ChainId.polygonMumbai:
            return { http: polygonMumbai.rpcUrls.default.http[0] };
          case ChainId.arbitrumGoerli:
            return { http: arbitrumGoerli.rpcUrls.default.http[0] };
          case ChainId.baseGoerli:
            return { http: baseGoerli.rpcUrls.default.http[0] };
          case ChainId.zoraTestnet:
            return { http: zoraTestnet.rpcUrls.default.http[0] };
          default:
            return null;
        }
      },
    }),
  ],
);

const asyncStoragePersister = createAsyncStoragePersister({
  key: 'rainbow.wagmi',
  storage: {
    getItem: Storage.get,
    setItem: Storage.set,
    removeItem: Storage.remove,
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
