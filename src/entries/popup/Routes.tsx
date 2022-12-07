import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { ConnectedApps } from './pages/ConnectedApps';
import { Home } from './pages/home';
import { ManualBackupPrompt } from './pages/manualBackupPrompt';
import { Send } from './pages/send';
import { Currency } from './pages/settings/currency';
import { AutoLockTimer } from './pages/settings/privacy/autoLockTimer';
import { Privacy } from './pages/settings/privacy/privacy';
import { Settings } from './pages/settings/settings';
import { Transactions } from './pages/settings/transactions';
import { Sign } from './pages/sign';
import { Unlock } from './pages/unlock';
import { Wallets } from './pages/wallets';
import { Welcome } from './pages/welcome';

export function Routes() {
  const location = useLocation();
  const routeMatch = matchRoutes(
    [
      {
        path: '/',
        element: (
          <AnimatedRoute direction="base">
            <Home />
          </AnimatedRoute>
        ),
      },
      {
        path: '/connected',
        element: (
          <AnimatedRoute
            direction="vertical"
            navbar
            title={i18n.t('connected_apps.title')}
          >
            <ConnectedApps />
          </AnimatedRoute>
        ),
      },
      {
        path: '/welcome',
        element: <Welcome />,
      },
      {
        path: '/unlock',
        element: <Unlock />,
      },
      {
        path: '/manual-backup-prompt',
        element: (
          <AnimatedRoute direction="horizontal" navbar>
            <ManualBackupPrompt />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <AnimatedRoute
            direction="vertical"
            navbar
            title={i18n.t('settings.title')}
          >
            <Settings />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/privacy',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t('privacy_and_security.title')}
          >
            <Privacy />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/privacy/autoLockTimer',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t('auto_lock_timer.title')}
          >
            <AutoLockTimer />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/transactions',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t('transactions.title')}
          >
            <Transactions />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/currency',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t('currency.title')}
          >
            <Currency />
          </AnimatedRoute>
        ),
      },
      {
        path: '/send',
        element: (
          <AnimatedRoute
            direction="vertical"
            navbar
            title={i18n.t('send.title')}
          >
            <Send />
          </AnimatedRoute>
        ),
      },
      {
        path: '/sign',
        element: (
          <AnimatedRoute
            direction="vertical"
            navbar
            title={i18n.t('sign.title')}
          >
            <Sign />
          </AnimatedRoute>
        ),
      },
      {
        path: '/wallets',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t('wallets.title')}
          >
            <Wallets />
          </AnimatedRoute>
        ),
      },
    ],
    location.pathname,
  );
  const element = routeMatch?.[0]?.route?.element;
  if (!element) {
    // error UI here probably
    return null;
  }
  return (
    <AnimatePresence mode="popLayout">
      {React.cloneElement(element, {
        key: location.pathname,
      })}
    </AnimatePresence>
  );
}
