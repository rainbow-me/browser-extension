import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { FullScreenBackground } from './components/FullScreen/FullScreenBackground';
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
import { WalletSwitcher } from './pages/walletSwitcher';
import { AddWallet } from './pages/walletSwitcher/addWallet';
import { NewImportWallet } from './pages/walletSwitcher/newImportWallet';
import { NewImportWalletSelection } from './pages/walletSwitcher/newImportWalletSelection';
import { NewImportWalletSelectionEdit } from './pages/walletSwitcher/newImportWalletSelectionEdit';
import { NewWatchWallet } from './pages/walletSwitcher/newWatchWallet';
import { Wallets } from './pages/wallets';
import { WatchWallet } from './pages/watchWallet';
import { Welcome } from './pages/welcome';
import { ROUTES } from './urls';

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
    path: ROUTES.APPROVE_APP_REQUEST,
    element: (
      <AnimatedRoute direction="base" protectedRoute>
        <ApproveAppRequest />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.CONNECTED,
    element: (
      <AnimatedRoute
        direction="up"
        navbar
        navbarIcon="ex"
        backTo={ROUTES.HOME}
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
      <AnimatedRoute direction="right" protectedRoute={['NEW']}>
        <ImportOrConnect />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.WATCH,
    element: (
      <AnimatedRoute direction="right" protectedRoute={['NEW']}>
        <WatchWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT,
    element: (
      <AnimatedRoute direction="right" protectedRoute={['NEW']}>
        <ImportWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__SELECT,
    element: (
      <AnimatedRoute direction="right" protectedRoute={['NEW']}>
        <ImportWalletSelection />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__EDIT,
    element: (
      <AnimatedRoute
        direction="right"
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
      <AnimatedRoute direction="right" protectedRoute={['NEEDS_PASSWORD']}>
        <SeedBackupPrompt />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEED_REVEAL,
    element: (
      <AnimatedRoute direction="right" protectedRoute={['NEEDS_PASSWORD']}>
        <SeedReveal />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEED_VERIFY,
    element: (
      <AnimatedRoute direction="right" protectedRoute={['NEEDS_PASSWORD']}>
        <SeedVerify />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.CREATE_PASSWORD,
    element: (
      <AnimatedRoute direction="right" protectedRoute={['NEEDS_PASSWORD']}>
        <CreatePassword />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS,
    element: (
      <AnimatedRoute
        backTo={ROUTES.HOME}
        direction="up"
        navbar
        navbarIcon="ex"
        title={i18n.t('settings.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Settings />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__PRIVACY,
    element: (
      <AnimatedRoute
        backTo={ROUTES.SETTINGS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY}
        direction="right"
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
        backTo={ROUTES.SETTINGS__PRIVACY}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.SETTINGS}
        direction="right"
        navbar
        navbarIcon="arrow"
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
        backTo={ROUTES.HOME}
        direction="right"
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
        backTo={ROUTES.HOME}
        direction="up"
        navbar
        navbarIcon="ex"
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
        backTo={ROUTES.HOME}
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('wallets.title')}
        protectedRoute
      >
        <Wallets />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.WALLET_SWITCHER,
    element: (
      <AnimatedRoute
        backTo={ROUTES.HOME}
        direction="up"
        navbar
        navbarIcon="ex"
        title={i18n.t('wallets.title')}
        protectedRoute
        background="surfacePrimaryElevated"
      >
        <WalletSwitcher />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.ADD_WALLET,
    element: (
      <AnimatedRoute
        backTo={ROUTES.WALLET_SWITCHER}
        direction="down"
        navbar
        navbarIcon="ex"
        title={i18n.t('add_wallet.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <AddWallet />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.NEW_WATCH_WALLET,
    element: (
      <AnimatedRoute
        backTo={ROUTES.ADD_WALLET}
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewWatchWallet />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.NEW_IMPORT_WALLET,
    element: (
      <AnimatedRoute
        backTo={ROUTES.ADD_WALLET}
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewImportWallet />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.NEW_IMPORT_WALLET_SELECTION,
    element: (
      <AnimatedRoute
        backTo={ROUTES.NEW_IMPORT_WALLET}
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewImportWalletSelection />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT,
    element: (
      <AnimatedRoute
        backTo={ROUTES.NEW_IMPORT_WALLET_SELECTION}
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewImportWalletSelectionEdit />
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
    // need to wait a tick for the page to render=
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }, [location.pathname]);
  const match = matchingRoute(location.pathname);
  const background = match?.background;
  const RoutesContainer = background ?? React.Fragment;
  const { innerHeight: windowHeight } = window;
  return (
    <Box
      style={{
        maxWidth:
          windowHeight === POPUP_DIMENSIONS.height
            ? POPUP_DIMENSIONS.width
            : undefined,
      }}
    >
      <RoutesContainer>
        <CurrentRoute pathname={location.pathname} />
      </RoutesContainer>
    </Box>
  );
}

function CurrentRoute(props: { pathname: string }) {
  const match = matchingRoute(props.pathname);
  const element = match?.element;
  const currentDirection = element?.props.direction;
  const { state } = useLocation();
  const previousMatch = matchingRoute(state?.from || '');
  const previousElement = previousMatch?.element;
  const previousDirection = previousElement?.props.direction;
  if (!element) {
    // error UI here probably
    return null;
  }
  const isBack = state?.isBack;
  const direction = isBack
    ? directionMap[previousDirection as Direction]
    : currentDirection;
  return (
    <AnimatePresence mode="popLayout">
      {React.cloneElement(element, {
        key: props.pathname,
        direction,
      })}
    </AnimatePresence>
  );
}

type Direction = 'right' | 'left' | 'up' | 'down' | 'base';
const directionMap = {
  right: 'left',
  up: 'down',
  left: 'right',
  down: 'up',
  base: 'base',
};
