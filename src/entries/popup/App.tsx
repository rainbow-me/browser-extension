import * as React from 'react';
import { WagmiConfig } from 'wagmi';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { createWagmiClient } from '~/core/wagmi';
import { persistOptions, queryClient } from '~/core/react-query';

import { useForceConnect } from './hooks/useForceConnect';
import { Index } from './pages';
import { RainbowConnector } from './wagmi/RainbowConnector';
import { PlaygroundComponents } from './pages/_playgrounds';

const playground = process.env.PLAYGROUND as 'default' | 'ds';

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
        {playground ? PlaygroundComponents[playground] : <Routes />}
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}
