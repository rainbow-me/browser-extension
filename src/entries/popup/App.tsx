import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { WagmiConfig, useAccount } from 'wagmi';

import { changeI18nLanguage } from '~/core/languages';
import { persistOptions, queryClient } from '~/core/react-query';
import { initializeSentry } from '~/core/sentry';
import { useCurrentLanguageStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { usePendingRequestStore } from '~/core/state/requests';
import { createWagmiClient } from '~/core/wagmi';
import { Box, ThemeProvider } from '~/design-system';

import { Routes } from './Routes';
import { AuthProvider } from './hooks/useAuth';
import { usePendingTransactionWatcher } from './hooks/usePendingTransactionWatcher';
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
  const { address } = useAccount();

  usePendingTransactionWatcher({ address });

  React.useEffect(() => {
    changeI18nLanguage(currentLanguage);
    initializeSentry('popup');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { pendingRequests } = usePendingRequestStore();
  const { currentTheme } = useCurrentThemeStore();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <WagmiConfig client={wagmiClient}>
        <ThemeProvider theme={currentTheme}>
          {playground ? (
            PlaygroundComponents[playground]
          ) : (
            <AuthProvider>
              <Box id="main" background="surfacePrimaryElevated">
                {pendingRequests[0] ? (
                  <ApproveMessage />
                ) : (
                  <HashRouter>
                    <Routes />
                  </HashRouter>
                )}
              </Box>
            </AuthProvider>
          )}
        </ThemeProvider>
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}
