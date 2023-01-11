import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { AnimatedRouteDirection } from '~/design-system/styles/designTokens';

import { FullScreenBackground } from './components/FullScreen/FullScreenBackground';
import LockPill from './components/LockPill/LockPill';
import { ConnectedApps } from './pages/ConnectedApps';
import { CreatePassword } from './pages/createPassword';
import { Home } from './pages/home';
import { ImportOrConnect } from './pages/importOrConnect';
import { ImportWallet } from './pages/importWallet';
import { ImportWalletSelection } from './pages/importWalletSelection';
import { EditImportWalletSelection } from './pages/importWalletSelection/EditImportWalletSelection';
import { ApproveAppRequest } from './pages/messages/ApproveAppRequest';
import { RootHandler } from './pages/rootHandler/RootHandler';
import { SeedBackupPrompt } from './pages/seedBackupPrompt';
import { SeedReveal } from './pages/seedReveal';
import { SeedVerify } from './pages/seedVerify';
import { Send } from './pages/send';
import { Currency } from './pages/settings/currency';
import { AutoLockTimer } from './pages/settings/privacy/autoLockTimer';
import { ChangePassword } from './pages/settings/privacy/changePassword';
import { Privacy } from './pages/settings/privacy/privacy';
import { PrivateKey } from './pages/settings/privacy/walletsAndKeys/privateKey/privateKey';
import { PrivateKeyWarning } from './pages/settings/privacy/walletsAndKeys/privateKey/warning';
import { RecoveryPhrase } from './pages/settings/privacy/walletsAndKeys/recoveryPhrase/recoveryPhrase';
import { RecoveryPhraseWarning } from './pages/settings/privacy/walletsAndKeys/recoveryPhrase/warning';
import { WalletDetails } from './pages/settings/privacy/walletsAndKeys/walletDetails';
import { WalletsAndKeys } from './pages/settings/privacy/walletsAndKeys/walletsAndKeys';
import { Settings } from './pages/settings/settings';
import { Transactions } from './pages/settings/transactions';
import { Sign } from './pages/sign';
import { Unlock } from './pages/unlock';
import { WalletReady } from './pages/walletReady';
import { Wallets } from './pages/wallets';
import { WatchWallet } from './pages/watchWallet';
import { Welcome } from './pages/welcome';
import { ROUTES } from './urls';

export const RouterContext = React.createContext({
  to: 'base',
  from: 'base',
});

const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const matchingDirection: AnimatedRouteDirection = matchingRoute(
    location.pathname,
  )?.element?.props?.direction;
  const [route, setRoute] = React.useState<
    Record<string, AnimatedRouteDirection>
  >({
    to: matchingDirection,
    from: matchingDirection,
  });
  React.useEffect(() => {
    const matchingDirection: string = matchingRoute(location.pathname)?.element
      ?.props?.direction;
    setRoute((prev) => ({ to: matchingDirection, from: prev.to }));
  }, [location?.pathname]);

  return (
    <RouterContext.Provider value={route}>{children}</RouterContext.Provider>
  );
};

const ROUTE_DATA = [
  {
    path: ROUTES.ROOT,
    element: (
      <AnimatedRoute direction="base" protectedRoute>
        <RootHandler />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.HOME,
    element: (
      <AnimatedRoute direction="base" protectedRoute>
        <Home />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.CONNECTED,
    element: (
      <AnimatedRoute
        direction="vertical"
        navbar
        title={i18n.t('connected_apps.title')}
        protectedRoute
      >
        <ConnectedApps />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.WELCOME,
    element: (
      <AnimatedRoute direction="base" protectedRoute={['NEW']}>
        <Welcome />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.READY,
    element: (
      <AnimatedRoute direction="deceleratedShort" protectedRoute={['READY']}>
        <WalletReady />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.IMPORT_OR_CONNECT,
    element: (
      <AnimatedRoute direction="horizontal" navbar protectedRoute={['NEW']}>
        <ImportOrConnect />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.WATCH,
    element: (
      <AnimatedRoute direction="horizontal" navbar protectedRoute={['NEW']}>
        <WatchWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT,
    element: (
      <AnimatedRoute direction="horizontal" navbar protectedRoute={['NEW']}>
        <ImportWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__SELECT,
    element: (
      <AnimatedRoute direction="horizontal" navbar protectedRoute={['NEW']}>
        <ImportWalletSelection />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__EDIT,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('edit_import_wallet_selection.title')}
        protectedRoute={['NEW']}
      >
        <EditImportWalletSelection />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.UNLOCK,
    element: (
      <AnimatedRoute direction="base" protectedRoute={['LOCKED']}>
        <Unlock />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEED_BACKUP_PROMPT,
    element: (
      <AnimatedRoute direction="horizontal" protectedRoute={['NEEDS_PASSWORD']}>
        <SeedBackupPrompt />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEED_REVEAL,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        protectedRoute={['NEEDS_PASSWORD']}
      >
        <SeedReveal />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEED_VERIFY,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        protectedRoute={['NEEDS_PASSWORD']}
      >
        <SeedVerify />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.CREATE_PASSWORD,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        protectedRoute={['NEEDS_PASSWORD']}
      >
        <CreatePassword />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS,
    element: (
      <AnimatedRoute
        direction="vertical"
        navbar
        title={i18n.t('settings.title')}
        protectedRoute
        background="surfaceSecondary"
        rightNavbarComponent={<LockPill />}
      >
        <Settings />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('settings.privacy_and_security.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Privacy />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__AUTOLOCK,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('settings.privacy_and_security.auto_lock_timer.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <AutoLockTimer />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__CHANGE_PASSWORD,
    element: (
      <AnimatedRoute
        direction="horizontal"
        protectedRoute
        background="surfaceSecondary"
      >
        <ChangePassword />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('settings.privacy_and_security.wallets_and_keys.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <WalletsAndKeys />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t(
          'settings.privacy_and_security.wallets_and_keys.wallet_details.title',
        )}
        protectedRoute
        background="surfaceSecondary"
      >
        <WalletDetails />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        background="surfaceSecondary"
        protectedRoute
      >
        <PrivateKeyWarning />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        background="surfaceSecondary"
        protectedRoute
      >
        <PrivateKey />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        background="surfaceSecondary"
        protectedRoute
      >
        <RecoveryPhraseWarning />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        background="surfaceSecondary"
        protectedRoute
      >
        <RecoveryPhrase />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__TRANSACTIONS,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('settings.transactions.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Transactions />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__CURRENCY,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('settings.currency.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Currency />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SEND,
    element: (
      <AnimatedRoute
        direction="horizontal"
        title={i18n.t('send.title')}
        protectedRoute
      >
        <Send />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SIGN,
    element: (
      <AnimatedRoute
        direction="vertical"
        navbar
        title={i18n.t('sign.title')}
        protectedRoute
      >
        <Sign />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.WALLETS,
    element: (
      <AnimatedRoute
        direction="horizontal"
        navbar
        title={i18n.t('wallets.title')}
        protectedRoute
      >
        <Wallets />
      </AnimatedRoute>
    ),
  },
];

const matchingRoute = (pathName: string) => {
  const routeMatch = matchRoutes(ROUTE_DATA, pathName);
  const match = routeMatch?.[0].route;
  return match;
};

export function Routes() {
  const location = useLocation();

  React.useEffect(() => {
    // need to wait a tick for the page to render
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, [location]);

  const match = matchingRoute(location.pathname);
  const element = match?.element;
  const background = match?.background;
  if (!element) {
    // error UI here probably
    return null;
  }
  const RoutesContainer = background ?? React.Fragment;

  console.log('LOCATION.PATHNAME: ', location.pathname);

  return (
    <RoutesContainer>
      <RouterProvider>
        <AnimatePresence mode="popLayout">
          {React.cloneElement(element, {
            key: location.pathname,
          })}
        </AnimatePresence>
      </RouterProvider>
    </RoutesContainer>
  );
}
