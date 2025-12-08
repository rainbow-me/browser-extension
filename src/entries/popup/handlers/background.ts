import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/message-port';
import {
  ClientRetryPlugin,
  ClientRetryPluginContext,
} from '@orpc/client/plugins';
import type { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import * as Sentry from '@sentry/react';

import type { PopupRouter } from '~/entries/background/procedures/popup';
import { POPUP_PORT_NAME } from '~/entries/background/procedures/popup/constants';

import { createDeepProxy } from './deepProxy';
import { autoReconnect } from './retry';

interface ORPCClientContext extends ClientRetryPluginContext {}

function createPort() {
  return chrome.runtime.connect({ name: POPUP_PORT_NAME });
}
function createClient(
  port: chrome.runtime.Port,
): RouterClient<PopupRouter, ORPCClientContext> {
  let isClosed = false;
  const closeHandler = () => {
    isClosed = true;
    port.onDisconnect.removeListener(closeHandler);
  };
  port.onDisconnect.addListener(closeHandler);

  return createORPCClient(
    new RPCLink({
      port,
      plugins: [
        new ClientRetryPlugin({
          default: {
            // retry 3 times (after 150ms, 300ms and 450ms; max total 900ms)
            retry: 3,
            retryDelay(t) {
              return (t.attemptIndex + 1) * 150;
            },
            // only retry if the error is a Not Found error, which indicates the background process is not yet ready
            shouldRetry({ error }) {
              return Boolean(
                error instanceof Error && error.message === 'Not Found',
              );
            },
            onRetry({ error, attemptIndex, path }) {
              const err =
                error instanceof Error ? error : new Error(String(error));
              const pathStr = path.join('/');

              Sentry.addBreadcrumb({
                category: 'orpc.retry',
                level: 'warning',
                message: `Retrying [${pathStr}] due to error: ${err.message}`,
                data: {
                  portName: port.name,
                  portClosed: isClosed,
                  errorName: err.name,
                  errorMessage: err.message,
                  errorStack: err.stack,
                  attemptIndex,
                  path: pathStr,
                  timestamp: new Date().toISOString(),
                },
              });

              return (isSuccess: boolean) => {
                Sentry.addBreadcrumb({
                  category: 'orpc.retry.result',
                  level: isSuccess ? 'info' : 'error',
                  message: `Retry result for [${pathStr}]: ${
                    isSuccess ? 'Success' : 'Failed'
                  }`,
                  data: {
                    portName: port.name,
                    portClosed: isClosed,
                    errorName: err.name,
                    errorMessage: err.message,
                    errorStack: err.stack,
                    attemptIndex,
                    path: pathStr,
                    result: isSuccess ? 'success' : 'failure',
                    timestamp: new Date().toISOString(),
                  },
                });
              };
            },
          },
        }),
      ],
    }),
  );
}

// Mutable reference to the latest client
const firstPort = createPort();
let _popupClient = createClient(firstPort);

/**
 * Stable export of the ORPC client that always references the latest client instance.
 *
 * WHY DEEP PROXY IS NEEDED:
 * 1. Client recreation: When the port disconnects, `_popupClient` is replaced with a new client.
 *    Without deep proxy, stored references like `const wallet = popupClient.wallet` would become stale.
 *
 * 2. Nested access patterns: Code accesses deeply nested properties like:
 *    - `popupClient.telemetry.addRouterBreadcrumb(...)`
 *    - `popupClient.wallet.sendTransaction(...)`
 *    - `popupClientQueryUtils.state.sessions.updateActiveSession.mutationOptions()`
 *
 * 3. TanStack Query utils: `popupClientQueryUtils` is created once and may store nested object
 *    references. Deep proxy ensures that even if `popupClientQueryUtils.state.sessions` is stored,
 *    accessing properties on it will always use the fresh client.
 *
 * 4. Function freshness: Functions are always returned directly (not cached), ensuring method calls
 *    always use the latest client instance, even when accessed through cached nested proxies.
 *
 * Without deep proxy, if someone stores `const telemetry = popupClient.telemetry` and the client
 * is recreated, `telemetry.addRouterBreadcrumb()` would use the stale client with a disconnected port.
 */
export const popupClient: RouterClient<PopupRouter, ORPCClientContext> =
  createDeepProxy(() => _popupClient);

autoReconnect(
  // Pass the initial port for reconnection logic
  'popup->background',
  firstPort,
  createPort,
  (newPort) => {
    _popupClient = createClient(newPort);
  },
);

export const popupClientQueryUtils = createTanstackQueryUtils(popupClient, {
  path: ['orpc'],
});
