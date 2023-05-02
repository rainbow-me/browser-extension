/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TransactionRequest } from '@ethersproject/providers';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Bytes } from 'ethers';
import * as React from 'react';
import { HashRouter } from 'react-router-dom';
import { Address, WagmiConfig, useAccount } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { flushQueuedEvents } from '~/analytics/flushQueuedEvents';
// !!!! DO NOT REMOVE THE NEXT 2 LINES BELOW !!!!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import config from '~/core/firebase/remoteConfig';
import { changeI18nLanguage } from '~/core/languages';
import { initializeMessenger } from '~/core/messengers';
import { persistOptions, queryClient } from '~/core/react-query';
import { initializeSentry, setSentryUser } from '~/core/sentry';
import { useCurrentLanguageStore, useDeviceIdStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { createWagmiClient } from '~/core/wagmi';
import { Box, ThemeProvider } from '~/design-system';
import { Alert } from '~/design-system/components/Alert/Alert';

import { Routes } from './Routes';
import { IdleTimer } from './components/IdleTimer/IdleTimer';
import { Toast } from './components/Toast/Toast';
import {
  personalSign,
  signTransactionFromHW,
  signTypedData,
} from './handlers/wallet';
import { AuthProvider } from './hooks/useAuth';
import { useIsFullScreen } from './hooks/useIsFullScreen';
import { usePendingTransactionWatcher } from './hooks/usePendingTransactionWatcher';
import { PlaygroundComponents } from './pages/_playgrounds';
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
  const { deviceId } = useDeviceIdStore();

  usePendingTransactionWatcher({ address });

  React.useEffect(() => {
    // Disable analytics & sentry for e2e and dev mode
    changeI18nLanguage(currentLanguage);

    if (process.env.IS_TESTING !== 'true' && process.env.IS_DEV !== 'true') {
      initializeSentry('popup');
      setSentryUser(deviceId);
      analytics.setDeviceId(deviceId);
      analytics.identify();
      analytics.track(event.popupOpened);
      setTimeout(() => flushQueuedEvents(), 1000);
    }

    if (process.env.IS_DEV !== 'true') {
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { currentTheme } = useCurrentThemeStore();
  const isFullScreen = useIsFullScreen();

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
              <Box
                id="main"
                background="surfacePrimaryElevated"
                style={{
                  maxWidth: !isFullScreen
                    ? `${POPUP_DIMENSIONS.width}px`
                    : undefined,
                }}
              >
                <HashRouter>
                  <Routes />
                </HashRouter>
              </Box>
              <IdleTimer />
              <HWRequestListener />
              <Toast />
              <Alert />
            </AuthProvider>
          )}
        </ThemeProvider>
      </WagmiConfig>
    </PersistQueryClientProvider>
  );
}

export const HWRequestListener = () => {
  const bgMessenger = initializeMessenger({ connect: 'background' });

  interface HWSigningRequest {
    action: 'signTransaction' | 'signMessage' | 'signTypedData';
    vendor: 'Ledger' | 'Trezor';
    payload:
      | TransactionRequest
      | { message: string; address: string }
      | { data: string | Bytes; address: string };
  }

  function isMessagePayload(
    payload: any,
  ): payload is { message: string; address: string } {
    return 'message' in payload && 'address' in payload;
  }
  function isTypedDataPayload(
    payload: any,
  ): payload is { data: any; address: string } {
    return 'data' in payload && 'address' in payload;
  }

  bgMessenger.reply('hwRequest', async (data: HWSigningRequest) => {
    let response;
    switch (data.action) {
      case 'signTransaction':
        response = await signTransactionFromHW(
          data.payload as TransactionRequest,
          data.vendor,
        );
        break;
      case 'signMessage':
        if (isMessagePayload(data.payload)) {
          response = await personalSign(
            data.payload.message,
            data.payload.address as Address,
          );
        }
        break;
      case 'signTypedData':
        if (isTypedDataPayload(data.payload)) {
          response = await signTypedData(
            data.payload.data,
            data.payload.address as Address,
          );
        }
        break;
    }

    bgMessenger.send('hwResponse', response);
  });
  return null;
};
