import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  Chain,
  CreateConfigParameters,
  configureChains,
  createConfig,
  createStorage,
} from 'wagmi';
import { arbitrum, bsc, mainnet, optimism, polygon } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { queryClient } from '../react-query';
import { Storage } from '../storage';

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, optimism, polygon, arbitrum, bsc] as Chain[],
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
    getItem: Storage.get,
    setItem: Storage.set,
    removeItem: Storage.remove,
  },
});

export function createTestWagmiClient({
  autoConnect,
  connectors,
  persist,
}: {
  autoConnect?: CreateConfigParameters['autoConnect'];
  connectors?: (opts: {
    chains: Chain[];
  }) => CreateConfigParameters['connectors'];
  persist?: boolean;
} = {}) {
  return createConfig({
    autoConnect,
    connectors: connectors ? connectors({ chains }) : undefined,
    persister: persist ? asyncStoragePersister : undefined,
    publicClient,
    // Passing `undefined` will use wagmi's default storage (window.localStorage).
    // If `persist` is falsy, we want to pass through a noopStorage.
    storage: persist ? undefined : createStorage({ storage: noopStorage }),
    // @ts-expect-error – TODO: fix this
    queryClient,
    webSocketPublicClient,
  });
}
