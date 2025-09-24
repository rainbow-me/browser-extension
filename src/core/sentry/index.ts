import * as Sentry from '@sentry/react';
import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

import { RainbowError, logger } from '~/logger';

import pkg from '../../../package.json';

export const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';
export const IS_TESTING = process.env.IS_TESTING === 'true';

// Common browser lifecycle errors that we want to ignore from Sentry
// Strings are partially matched; use RegExp for exact matches
const IGNORED_ERRORS: (string | RegExp)[] = [
  'Could not establish connection. Receiving end does not exist.',
  "Duplicate script ID 'inpage'",
  'The page keeping the extension port is moved into back/forward cache, so the message channel is closed.',
  'The browser is shutting down.',
];

function detectPopupContext() {
  if (chrome.extension.getViews({ type: 'popup' }).some((v) => v === window))
    return 'action-popup'; // chrome toolbar popup
  if (new URLSearchParams(location.search).has('tabId')) return 'dapp-prompt'; // background spawned popup for dapps
  return 'fullscreen'; // normal tab
}

/**
 * Schedules a function to run when the browser is idle (if available), or as soon as possible otherwise.
 * Returns a Promise resolving to the function's result.
 * Works in browsers, service workers, and Node.js.
 *
 * Tries, in order:
 *   - requestIdleCallback (browser, service worker)
 *   - setImmediate (Node.js, IE/Edge)
 *   - microtask (Promise.resolve().then)
 */
export function lazy<T>(fn: () => Promise<T>): Promise<T> {
  // Prefer requestIdleCallback if available (browser, some workers)
  const globalScope =
    typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : undefined;

  if (globalScope && typeof globalScope.requestIdleCallback === 'function') {
    return new Promise<T>((resolve, reject) => {
      globalScope.requestIdleCallback(
        () => {
          fn().then(resolve, reject);
        },
        { timeout: 1000 },
      );
    });
  }

  // Node.js or IE/Edge: setImmediate
  if (typeof setImmediate === 'function') {
    return new Promise<T>((resolve, reject) => {
      setImmediate(() => {
        fn().then(resolve, reject);
      });
    });
  }

  // Fallback: schedule as microtask
  return Promise.resolve().then(fn);
}

type Integration = ReturnType<typeof Sentry.httpClientIntegration>; // not exported

const INTEGRATIONS: Array<{
  on: 'popup' | 'background' | 'shared';
  lazy: boolean;
  integrations: Integration[];
}> = [
  {
    on: 'shared',
    lazy: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
    ],
  },
  {
    on: 'shared',
    lazy: true,
    integrations: [
      Sentry.extraErrorDataIntegration(),
      Sentry.httpClientIntegration(),
      Sentry.zodErrorsIntegration(),
    ],
  },
  {
    on: 'popup',
    lazy: false,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
  },
  {
    on: 'popup',
    lazy: true,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }), // This masks all inputs and texts, so it should be safe
    ],
  },
];

export function initializeSentry(entrypoint: 'popup' | 'background') {
  if (process.env.IS_DEV !== 'true' && process.env.SENTRY_DSN) {
    try {
      const contextIntegrations = INTEGRATIONS.filter(
        (i) => i.on === entrypoint || i.on === 'shared',
      );
      const integrations = contextIntegrations
        .filter((i) => i.lazy === false)
        .flatMap((i) => i.integrations);

      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations,
        tracesSampleRate: INTERNAL_BUILD ? 1.0 : 0.1, // 10% sampling in prod
        replaysSessionSampleRate: INTERNAL_BUILD ? 1.0 : 0.1, // 10% sampling in prod
        replaysOnErrorSampleRate: 1.0, // 100% sampling in prod
        release: pkg.version,
        environment: IS_TESTING
          ? 'e2e'
          : INTERNAL_BUILD
          ? 'internal'
          : 'production',
        ignoreErrors: IGNORED_ERRORS,
        beforeBreadcrumb(breadcrumb, hint) {
          try {
            // Only enhance HTTP-like breadcrumbs across platforms
            const cat = breadcrumb.category;

            // ---- Browser: fetch ----
            if (cat === 'fetch' && hint) {
              if ('response' in hint && hint.response) {
                const res = hint.response as Response;
                const status = res.status;
                if (
                  typeof status === 'number' &&
                  (status < 200 || status >= 300)
                ) {
                  const h = res.headers as Headers;
                  const requestId = h.get('x-request-id') ?? undefined;
                  const traceId = h.get('x-trace-id') ?? undefined;

                  return {
                    ...breadcrumb,
                    data: {
                      ...breadcrumb.data,
                      status,
                      ...(requestId && { requestId }),
                      ...(traceId && { traceId }),
                    },
                    message: [
                      breadcrumb.message ?? '',
                      `(HTTP error: status ${status}`,
                      requestId ? `requestId: ${requestId}` : '',
                      traceId ? `traceId: ${traceId}` : '',
                      ')',
                    ]
                      .filter(Boolean)
                      .join(' '),
                  };
                }
              } else {
                // no response object
                return {
                  ...breadcrumb,
                  data: {
                    ...breadcrumb.data,
                    hint, // enhance by hint, this will help to identify the client error
                  },
                };
              }
              return breadcrumb;
            }

            // ---- Browser: XHR ----
            if (cat === 'xhr' && hint && 'xhr' in hint && hint.xhr) {
              const xhr = hint.xhr as XMLHttpRequest;
              const status = xhr.status;

              // Parse headers from XHR
              const raw = xhr.getAllResponseHeaders?.() ?? '';
              const headerObj = raw
                .trim()
                .split(/[\r\n]+/)
                .reduce<Record<string, string>>((acc, line) => {
                  const idx = line.indexOf(':');
                  if (idx !== -1)
                    acc[line.slice(0, idx).toLowerCase()] = line
                      .slice(idx + 1)
                      .trim();
                  return acc;
                }, {});

              if (
                typeof status === 'number' &&
                (status < 200 || status >= 300)
              ) {
                const requestId = headerObj['x-request-id'];
                const traceId = headerObj['x-trace-id'];
                return {
                  ...breadcrumb,
                  data: {
                    ...breadcrumb.data,
                    status,
                    ...(requestId && { requestId }),
                    ...(traceId && { traceId }),
                  },
                  message: [
                    breadcrumb.message ?? '',
                    `(HTTP error: status ${status}`,
                    requestId ? `requestId: ${requestId}` : '',
                    traceId ? `traceId: ${traceId}` : '',
                    ')',
                  ]
                    .filter(Boolean)
                    .join(' '),
                };
              }
              return breadcrumb;
            }
          } catch (e) {
            logger.error(
              new RainbowError('sentry beforeBreadcrumb error', { cause: e }),
            );
          }

          // Other categories or on error, return unchanged
          return breadcrumb;
        },
      });

      Sentry.setTag('entrypoint', entrypoint);

      if (entrypoint === 'popup')
        Sentry.setTag('popupType', detectPopupContext());

      const lazyIntegrations = contextIntegrations
        .filter((i) => i.lazy === true)
        .flatMap((i) => i.integrations);

      void lazy(async () => {
        for (const integration of lazyIntegrations) {
          // dynamic loading is not needed, as we have no network latency
          // lazy loading is done here to reduce runtime cpu and memory usage
          Sentry.addIntegration(integration);
        }
      });
    } catch (e) {
      logger.error(
        new RainbowError('sentry failed to initialize', { cause: e }),
      );
    }
  }
}

export function setSentryUser({
  deviceId,
  walletAddressHash,
  walletType,
}: {
  deviceId: string;
  walletAddressHash?: string;
  walletType?: 'owned' | 'hardware' | 'watched';
}) {
  Sentry.setUser({
    id: deviceId,
    walletAddressHash,
    walletType,
  });
}
