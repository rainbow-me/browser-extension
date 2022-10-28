import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';

import { persistOptions, queryClient } from '~/core/react-query';
import { initializeSentry } from '~/core/sentry';
import { usePendingRequestStore } from '~/core/state/pendingRequest';
import { createWagmiClient } from '~/core/wagmi';
import { Box } from '~/design-system';

import { Routes } from './Routes';
import { ApproveMessage } from './components/ApproveMessage';
import { PlaygroundComponents } from './pages/_playgrounds';
import { RainbowConnector } from './wagmi/RainbowConnector';

const playground = process.env.PLAYGROUND as 'default' | 'ds';

const wagmiClient = createWagmiClient({
  autoConnect: true,
  connectors: ({ chains }) => [new RainbowConnector({ chains })],
  persist: true,
});

export function App() {
  React.useEffect(() => {
    initializeSentry();
  }, []);

  const { pendingRequests } = usePendingRequestStore();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <WagmiConfig client={wagmiClient}>
        {playground ? (
          PlaygroundComponents[playground]
        ) : (
          <Box
            id="main"
            style={{ overflow: 'auto' }}
            background="surfacePrimaryElevated"
          >
            {pendingRequests[0] ? (
              <ApproveMessage />
            ) : (
              <HashRouter>
                <Routes />
              </HashRouter>
            )}
          </Box>
        )}
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}
