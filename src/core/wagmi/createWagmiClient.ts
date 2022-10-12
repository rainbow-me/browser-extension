import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { configureChains, chain, createClient } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { queryClient } from '../react-query';
import { Storage } from '../storage';

const { provider, webSocketProvider } = configureChains(
  [chain.mainnet],
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

export function createWagmiClient({ persist }: { persist?: boolean } = {}) {
  return createClient({
    // @ts-expect-error – TODO: fix this
    queryClient,
    persister: persist ? asyncStoragePersister : undefined,
    provider,
    webSocketProvider,
  });
}
