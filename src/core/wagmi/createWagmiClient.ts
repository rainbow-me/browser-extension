import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  Chain,
  CreateClientConfig,
  chain,
  configureChains,
  createClient,
  createStorage,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { queryClient } from '../react-query';
import { Storage } from '../storage';
import { ChainId, bsc, hardhat } from '../types/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const SUPPORTED_CHAINS = [
  chain.mainnet,
  chain.optimism,
  chain.polygon,
  chain.arbitrum,
  bsc,
];

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
        if (chain.id === ChainId.bsc || chain.id === ChainId.hardhat)
          return { http: chain.rpcUrls.default };
        return null;
      },
    }),
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
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
