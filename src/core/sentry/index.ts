import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

import { version } from '../../../package.json';

export function initializeSentry(context: 'popup' | 'background') {
  if (process.env.IS_DEV !== 'true' && process.env.SENTRY_DSN) {
    try {
      const integrations = context === 'popup' ? [new BrowserTracing()] : [];
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations,
        tracesSampleRate: 1.0,
        release: version,
        environment:
          process.env.INTERNAL_BUILD === 'true' ? 'internal' : 'production',
      });
    } catch (e) {
      console.log('sentry failed to initialize', e);
    }
  }
}

export function setSentryUser(deviceId: string) {
  Sentry.setUser({
    id: deviceId,
  });
}
