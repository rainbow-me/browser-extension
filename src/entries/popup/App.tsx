import * as React from 'react';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { useAccount, useConnect, WagmiConfig } from 'wagmi';
import { Index } from './pages';
import { Storage } from '~/core/storage';
import { createWagmiClient } from '~/core/wagmi';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    getItem: Storage.get,
    setItem: Storage.set,
    removeItem: Storage.remove,
  },
});

const wagmiClient = createWagmiClient({ persister: asyncStoragePersister });

export function Routes() {
  const { isConnected } = useAccount();
  const { connect, connectors, isError, error } = useConnect();

  React.useEffect(() => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors, isConnected]);

  return (
    <div>
      {isError && <div>error connecting. {error?.message}</div>}
      {isConnected && <Index />}
    </div>
  );
}

export function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <Routes />
    </WagmiConfig>
  );
}
