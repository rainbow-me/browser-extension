import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  Chain,
  CreateClientConfig,
  configureChains,
  createClient,
  createStorage,
} from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
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
            return { http: chain.rpcUrls.default };
          case ChainId.mainnet:
            return { http: process.env.ETH_MAINNET_RPC as string };
          case ChainId.optimism:
            return { http: process.env.OPTIMISM_MAINNET_RPC as string };
          case ChainId.arbitrum:
            return { http: process.env.ARBITRUM_MAINNET_RPC as string };
          case ChainId.polygon:
            return { http: process.env.POLYGON_MAINNET_RPC as string };
          case ChainId.bsc:
            return { http: process.env.BSC_MAINNET_RPC as string };
          default:
            return null;
        }
      },
    }),
    infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
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
    // @ts-expect-error – TODO: fix this
    queryClient,
    webSocketProvider,
  });
}
