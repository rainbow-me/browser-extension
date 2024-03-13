import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { isEqual } from 'lodash';
import * as React from 'react';
import { WagmiConfig } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { flushQueuedEvents } from '~/analytics/flushQueuedEvents';
// !!!! DO NOT REMOVE THE NEXT 2 LINES BELOW !!!!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import config from '~/core/firebase/remoteConfig';
import { initializeMessenger } from '~/core/messengers';
import { persistOptions, queryClient } from '~/core/react-query';
import { initializeSentry, setSentryUser } from '~/core/sentry';
import { useCurrentLanguageStore, useDeviceIdStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { createWagmiClient } from '~/core/wagmi';
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
import { PlaygroundComponents } from './pages/_playgrounds';
import { RainbowConnector } from './wagmi/RainbowConnector';

const playground = process.env.PLAYGROUND as 'default' | 'ds';
const backgroundMessenger = initializeMessenger({ connect: 'background' });

export function App() {
  const { currentLanguage, setCurrentLanguage } = useCurrentLanguageStore();
  const { deviceId } = useDeviceIdStore();
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

  const wagmiClient = React.useMemo(
    () =>
      createWagmiClient({
        autoConnect: true,
        connectors: ({ chains }) => [new RainbowConnector({ chains })],
        persist: true,
        rainbowChains,
        useProxy: config.rpc_proxy_enabled,
      }),
    [rainbowChains],
  );

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
      setSentryUser(deviceId);
      analytics.setDeviceId(deviceId);
      analytics.identify();
      analytics.track(event.popupOpened);
      setTimeout(() => flushQueuedEvents(), 1000);
    }
    // Init trezor once globally
    window.TrezorConnect?.init({
      manifest: {
        email: 'support@rainbow.me',
        appUrl: 'https://rainbow.me',
      },
      lazyLoad: true,
      connectSrc: 'https://connect.trezor.io/9/',
    });

    if (process.env.IS_DEV !== 'true') {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
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
        <WagmiConfig client={wagmiClient}>
          <ThemeProvider theme={currentTheme}>
            {playground ? (
              PlaygroundComponents[playground]
            ) : (
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
              </AuthProvider>
            )}
          </ThemeProvider>
        </WagmiConfig>
      </PersistQueryClientProvider>
      <HWRequestListener />
    </>
  );
}
