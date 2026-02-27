import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import TrezorConnect from '@trezor/connect-web';
import { isEqual } from 'lodash';
import * as React from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { flushQueuedEvents } from '~/analytics/flushQueuedEvents';
import { persistOptions, queryClient } from '~/core/react-query';
import { initializeSentry } from '~/core/sentry';
import { useCurrentLanguageStore, useCurrentThemeStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { TelemetryIdentifier } from '~/core/telemetry';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { updateViemClientsWrapper } from '~/core/viem';
import { Box, ThemeProvider } from '~/design-system';

import { Routes } from './Routes';
import { HWRequestListener } from './components/HWRequestListener/HWRequestListener';
import { OnboardingKeepAlive } from './components/OnboardingKeepAlive';
import { popupClient } from './handlers/background';
import { useExpiryListener } from './hooks/useExpiryListener';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import { useLastActivityUpdater } from './hooks/useLastActivityUpdater';
import usePrevious from './hooks/usePrevious';

initializeSentry('popup');

export function App() {
  const { currentLanguage, setCurrentLanguage } = useCurrentLanguageStore();
  const activeChains = useNetworkStore((state) =>
    state.getAllActiveRpcChains(),
  );
  const prevChains = usePrevious(activeChains);

  useExpiryListener();
  useLastActivityUpdater();

  React.useEffect(() => {
    if (!isEqual(prevChains, activeChains)) {
      void popupClient.state.viem.updateClient();
      updateViemClientsWrapper(activeChains);
    }
  }, [prevChains, activeChains]);

  React.useEffect(() => {
    // Init trezor once globally
    TrezorConnect?.init({
      manifest: {
        email: 'support@rainbow.me',
        appUrl: 'https://rainbow.me',
      },
      lazyLoad: true,
      transports: ['BridgeTransport', 'WebUsbTransport'],
      connectSrc: 'https://connect.trezor.io/9/',
    });

    if (process.env.IS_DEV !== 'true') {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // prevent trackpad double tap zoom
    const app = document.getElementById('app');
    app?.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    });

    // Report analytics events on popup open
    analytics.track(event.popupOpened);
    setTimeout(() => flushQueuedEvents(), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setCurrentLanguage(currentLanguage);
  }, [currentLanguage, setCurrentLanguage]);

  const { currentTheme } = useCurrentThemeStore();
  const isFullScreen = useIsFullScreen();

  return (
    <>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={currentTheme}>
            <Box
              id="main"
              background="surfacePrimaryElevated"
              style={{
                maxWidth: !isFullScreen
                  ? `${POPUP_DIMENSIONS.width}px`
                  : undefined,
              }}
            >
              <Routes />
            </Box>
            <OnboardingKeepAlive />
            <TelemetryIdentifier />
          </ThemeProvider>
        </QueryClientProvider>
      </PersistQueryClientProvider>
      <HWRequestListener />
    </>
  );
}
