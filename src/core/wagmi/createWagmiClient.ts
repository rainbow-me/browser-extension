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

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

export const bsc: Chain = {
  id: 56,
  name: 'Binance Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'Binance Chain',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: process.env.BSC_MAINNET_RPC as string,
  },
  blockExplorers: {
    default: { name: '', url: 'https://www.bscscan.com/' },
  },
  testnet: false,
};

const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.optimism, chain.polygon, chain.arbitrum, bsc],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== bsc.id) return null;
        return { http: chain.rpcUrls.default };
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
