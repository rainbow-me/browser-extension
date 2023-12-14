import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Chain } from '@wagmi/core';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import {
  arbitrum,
  base,
  bsc,
  mainnet,
  optimism,
  polygon,
  zora,
} from 'viem/chains';
import {
  CreateClientConfig,
  configureChains,
  createClient,
  createStorage,
} from 'wagmi';

import { queryClient } from '../react-query';
import { LocalStorage } from '../storage';

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, optimism, polygon, arbitrum, base, zora, bsc] as Chain[],
  [
    jsonRpcProvider({
      rpc: () => {
        return { http: 'http://127.0.0.1:8545' };
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

export function createTestWagmiClient({
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
