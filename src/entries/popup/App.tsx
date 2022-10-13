import * as React from 'react';
import { useAccount, useConnect, WagmiConfig } from 'wagmi';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Index } from './pages';
import { createWagmiClient } from '~/core/wagmi';
import { persistOptions, queryClient } from '~/core/react-query';

const wagmiClient = createWagmiClient({ persist: true });

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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <WagmiConfig client={wagmiClient}>
        <Routes />
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}
