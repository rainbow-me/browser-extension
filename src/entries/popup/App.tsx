import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import TrezorConnect from '@trezor/connect-web';
import { isEqual } from 'lodash';
import * as React from 'react';
import { WagmiProvider } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { flushQueuedEvents } from '~/analytics/flushQueuedEvents';
// !!!! DO NOT REMOVE THE NEXT 2 LINES BELOW !!!!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import config from '~/core/firebase/remoteConfig';
import { initializeMessenger } from '~/core/messengers';
import { persistOptions, queryClient } from '~/core/react-query';
import { initializeSentry } from '~/core/sentry';
import { useCurrentLanguageStore, useCurrentThemeStore } from '~/core/state';
import { TelemetryIdentifier } from '~/core/telemetry';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { WagmiConfigUpdater, wagmiConfig } from '~/core/wagmi';
import { Box, ThemeProvider } from '~/design-system';

import { Routes } from './Routes';
import { HWRequestListener } from './components/HWRequestListener/HWRequestListener';
import { IdleTimer } from './components/IdleTimer/IdleTimer';
import { OnboardingKeepAlive } from './components/OnboardingKeepAlive';
import { AuthProvider } from './hooks/useAuth';
import { useExpiryListener } from './hooks/useExpiryListener';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import usePrevious from './hooks/usePrevious';
import { useRainbowChains } from './hooks/useRainbowChains';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export function App() {
  const { currentLanguage, setCurrentLanguage } = useCurrentLanguageStore();
  const { rainbowChains } = useRainbowChains();
  const prevChains = usePrevious(rainbowChains);

  useExpiryListener();

  React.useEffect(() => {
    if (!isEqual(prevChains, rainbowChains)) {
      backgroundMessenger.send('rainbow_updateWagmiClient', {
        rpcProxyEnabled: config.rpc_proxy_enabled,
      });
    }
  }, [prevChains, rainbowChains]);

  React.useEffect(() => {
    if (!isEqual(prevChains, rainbowChains)) {
      backgroundMessenger.send('rainbow_updateWagmiClient', {
        rpcProxyEnabled: config.rpc_proxy_enabled,
      });
    }
  }, [prevChains, rainbowChains]);

  React.useEffect(() => {
    // Disable analytics & sentry for e2e and dev mode
    if (process.env.IS_TESTING !== 'true' && process.env.IS_DEV !== 'true') {
      initializeSentry('popup');
      analytics.track(event.popupOpened);
      setTimeout(() => flushQueuedEvents(), 1000);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setCurrentLanguage(currentLanguage);
  }, [currentLanguage, setCurrentLanguage]);

  const { currentTheme } = useCurrentThemeStore();
  const isFullScreen = useIsFullScreen();

  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={currentTheme}>
              <AuthProvider>
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
                <IdleTimer />
                <OnboardingKeepAlive />
                <WagmiConfigUpdater />
                <TelemetryIdentifier />
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </PersistQueryClientProvider>
      </WagmiProvider>
      <HWRequestListener />
    </>
  );
}
