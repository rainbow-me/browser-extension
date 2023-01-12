import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

export function initializeSentry(context: 'popup' | 'background') {
  if (process.env.IS_DEV !== 'true' && process.env.SENTRY_DSN) {
    try {
      const integrations = context === 'popup' ? [new BrowserTracing()] : [];
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations,
        tracesSampleRate: 1.0,
      });
      console.log('sentry initialized correctly!');
    } catch (e) {
      console.log('sentry failed to initialize', e);
    }
  }
}
