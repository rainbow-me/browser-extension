import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';

import { changeI18nLanguage } from '~/core/languages';
import { persistOptions, queryClient } from '~/core/react-query';
import { useCurrentLanguageStore } from '~/core/state';
import { usePendingRequestStore } from '~/core/state/requests';
import { createWagmiClient } from '~/core/wagmi';
import { Box } from '~/design-system';

import { Routes } from './Routes';
import { PlaygroundComponents } from './pages/_playgrounds';
import { ApproveMessage } from './pages/messages/ApproveMessage';
import { RainbowConnector } from './wagmi/RainbowConnector';

const playground = process.env.PLAYGROUND as 'default' | 'ds';

const wagmiClient = createWagmiClient({
  autoConnect: true,
  connectors: ({ chains }) => [new RainbowConnector({ chains })],
  persist: true,
});

export function App() {
  const { currentLanguage } = useCurrentLanguageStore();

  React.useEffect(() => {
    changeI18nLanguage(currentLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Box id="main" background="surfacePrimaryElevated">
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
