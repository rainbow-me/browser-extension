import * as React from 'react';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { WagmiConfig } from 'wagmi';
import { Index } from './pages';
import { Storage } from '~/core/storage';
import { createWagmiClient } from '~/core/wagmi';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => (await Storage.get(key)) as string,
    setItem: Storage.set,
    removeItem: Storage.remove,
  },
});

const wagmiClient = createWagmiClient({ persister: asyncStoragePersister });

export function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <Index />
    </WagmiConfig>
  );
}
