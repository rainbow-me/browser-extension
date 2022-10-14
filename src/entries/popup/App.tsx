import * as React from 'react';
import { WagmiConfig } from 'wagmi';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Index } from './pages';
import { createWagmiClient } from '~/core/wagmi';
import { persistOptions, queryClient } from '~/core/react-query';
import { RainbowConnector } from '~/core/wagmi/RainbowConnector';
import { useForceConnect } from './hooks/useForceConnect';

const wagmiClient = createWagmiClient({
  autoConnect: true,
  connectors: ({ chains }) => [new RainbowConnector({ chains })],
  persist: true,
});

export function Routes() {
  const { error, isConnected, isError } = useForceConnect();

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
