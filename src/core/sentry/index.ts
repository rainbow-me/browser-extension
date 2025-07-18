import * as Sentry from '@sentry/browser';

import pkg from '../../../package.json';

// Any error that we don't wanna send to sentry should be added here
// via partial match
const IGNORED_ERRORS = [
  'Duplicate script ID',
  'Could not establish connection',
  'The message port closed',
  'The browser is shutting down',
  'The page keeping the extension port is moved into back/forward cache, so the message channel is closed.',
];

export function initializeSentry(
  context: 'popup' | 'background' | 'content' | 'inpage' | 'iframe',
) {
  if (process.env.IS_DEV !== 'true' && process.env.SENTRY_DSN) {
    try {
      const integrations =
        context === 'popup' ? [Sentry.browserTracingIntegration()] : [];

      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations,
        tracesSampleRate: process.env.INTERNAL_BUILD === 'true' ? 1.0 : 0.2, // 20% sampling in prod
        release: pkg.version,
        environment: process.env.SENTRY_ENVIRONMENT || 
          (process.env.INTERNAL_BUILD === 'true' ? 'internal' : 'production'),
        beforeSend(event) {
          for (const ignoredError of IGNORED_ERRORS) {
            if (event.message?.includes(ignoredError)) {
              return null;
            }
          }
          return event;
        },
        // Set context-specific tags
        initialScope: {
          tags: {
            context,
          },
        },
      });

      // Set context-specific user context
      Sentry.setContext('extension', {
        context,
        userAgent: navigator.userAgent,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
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
