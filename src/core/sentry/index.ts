import * as Sentry from '@sentry/react';
import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

import pkg from '../../../package.json';

const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

// Any error that we don't wanna send to sentry should be added here
// via partial match
const IGNORED_ERRORS = [
  'Duplicate script ID',
  'Could not establish connection',
  'The message port closed',
  'The browser is shutting down',
];

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

export function initializeSentry(context: 'popup' | 'background') {
  if (
    process.env.IS_DEV !== 'true' &&
    process.env.IS_TESTING !== 'true' &&
    process.env.SENTRY_DSN
  ) {
    try {
      const contextIntegrations = INTEGRATIONS.filter(
        (i) => i.on === context || i.on === 'shared',
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
        environment: INTERNAL_BUILD ? 'internal' : 'production',
        beforeSend(event) {
          for (const ignoredError of IGNORED_ERRORS) {
            if (event.message?.includes(ignoredError)) {
              return null;
            }
          }
          return event;
        },
      });

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
      console.log('sentry failed to initialize', e);
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
