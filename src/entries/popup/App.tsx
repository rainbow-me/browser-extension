import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { createWagmiClient } from '~/core/wagmi';
import { persistOptions, queryClient } from '~/core/react-query';

import { RainbowConnector } from './wagmi/RainbowConnector';
import { PlaygroundComponents } from './pages/_playgrounds';
import { Routes } from './Routes';

const playground = process.env.PLAYGROUND as 'default' | 'ds';

const wagmiClient = createWagmiClient({
  autoConnect: true,
  connectors: ({ chains }) => [new RainbowConnector({ chains })],
  persist: true,
});

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <WagmiConfig client={wagmiClient}>
        {playground ? (
          PlaygroundComponents[playground]
        ) : (
          <HashRouter>
            <Routes />
          </HashRouter>
        )}
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}
