import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  configureChains,
  chain,
  createClient,
  CreateClientConfig,
  Chain,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { queryClient } from '../react-query';
import { Storage } from '../storage';

const { chains, provider, webSocketProvider } = configureChains(
  [chain.mainnet, chain.polygon],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
    infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
    publicProvider(),
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
    // @ts-expect-error – TODO: fix this
    queryClient,
    webSocketProvider,
  });
}
