import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { FullScreenBackground } from './components/FullScreen/FullScreenBackground';
import { ConnectedApps } from './pages/ConnectedApps';
import { Home } from './pages/home';
import { SeedBackupPrompt } from './pages/seedBackupPrompt';
import { SeedReveal } from './pages/seedReveal';
import { SeedVerify } from './pages/seedVerify';
import { Send } from './pages/send';
import { Currency } from './pages/settings/currency';
import { AutoLockTimer } from './pages/settings/privacy/autoLockTimer';
import { ChangePassword } from './pages/settings/privacy/changePassword';
import { Privacy } from './pages/settings/privacy/privacy';
import { AccountDetails } from './pages/settings/privacy/walletsAndKeys/AccountDetails';
import { WalletsAndKeys } from './pages/settings/privacy/walletsAndKeys/walletsAndKeys';
import { Settings } from './pages/settings/settings';
import { Transactions } from './pages/settings/transactions';
import { Sign } from './pages/sign';
import { Unlock } from './pages/unlock';
import { Wallets } from './pages/wallets';
import { Welcome } from './pages/welcome';

export function Routes() {
  const location = useLocation();

  React.useEffect(() => {
    // need to wait a tick for the page to render
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, [location]);

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
        element: (
          <AnimatedRoute direction="base">
            <Welcome />
          </AnimatedRoute>
        ),
        background: FullScreenBackground,
      },
      {
        path: '/unlock',
        element: (
          <AnimatedRoute direction="base">
            <Unlock />
          </AnimatedRoute>
        ),
        background: FullScreenBackground,
      },
      {
        path: '/seed-backup-prompt',
        element: (
          <AnimatedRoute direction="horizontal">
            <SeedBackupPrompt />
          </AnimatedRoute>
        ),
        background: FullScreenBackground,
      },
      {
        path: '/seed-reveal',
        element: (
          <AnimatedRoute direction="horizontal" navbar>
            <SeedReveal />
          </AnimatedRoute>
        ),
        background: FullScreenBackground,
      },
      {
        path: '/seed-verify',
        element: (
          <AnimatedRoute direction="horizontal" navbar>
            <SeedVerify />
          </AnimatedRoute>
        ),
        background: FullScreenBackground,
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
            title={i18n.t('settings.privacy_and_security.title')}
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
            title={i18n.t(
              'settings.privacy_and_security.auto_lock_timer.title',
            )}
          >
            <AutoLockTimer />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/privacy/changePassword',
        element: (
          <AnimatedRoute direction="horizontal">
            <ChangePassword />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/privacy/walletsAndKeys',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t(
              'settings.privacy_and_security.wallets_and_keys.title',
            )}
          >
            <WalletsAndKeys />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/privacy/walletsAndKeys/accountDetails',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t(
              'settings.privacy_and_security.wallets_and_keys.account_details.title',
            )}
          >
            <AccountDetails />
          </AnimatedRoute>
        ),
      },
      {
        path: '/settings/transactions',
        element: (
          <AnimatedRoute
            direction="horizontal"
            navbar
            title={i18n.t('settings.transactions.title')}
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
            title={i18n.t('settings.currency.title')}
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
  const match = routeMatch?.[0]?.route;
  const element = match?.element;
  const background = match?.background;
  if (!element) {
    // error UI here probably
    return null;
  }
  const RoutesContainer = background ?? React.Fragment;
  return (
    <RoutesContainer>
      <AnimatePresence mode="popLayout">
        {React.cloneElement(element, {
          key: location.pathname,
        })}
      </AnimatePresence>
    </RoutesContainer>
  );
}
