import * as React from 'react';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { WagmiConfig } from 'wagmi';
import { Index } from './pages';
import { storage } from '~/core/storage';
import { createWagmiClient } from '~/core/wagmi';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: storage.get,
    setItem: storage.set,
    removeItem: storage.remove,
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
