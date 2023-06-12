import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { matchRoutes, useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { FullScreenBackground } from './components/FullScreen/FullScreenBackground';
import { ImportWalletSelectionEdit } from './components/ImportWallet/ImportWalletSelectionEdit';
import { ImportWalletViaPrivateKey } from './components/ImportWallet/ImportWalletViaPrivateKey';
import { ImportWalletViaSeed } from './components/ImportWallet/ImportWalletViaSeed';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { CreatePassword } from './pages/createPassword';
import { Home } from './pages/home';
import { ConnectedApps } from './pages/home/ConnectedApps';
import { ChooseHW } from './pages/hw/chooseHW';
import { ConnectLedger } from './pages/hw/ledger';
import { SuccessHW } from './pages/hw/success';
import { ConnectTrezor } from './pages/hw/trezor';
import { WalletListHW } from './pages/hw/walletList';
import { ImportOrConnect } from './pages/importOrConnect';
import { ImportWallet } from './pages/importWallet';
import { ImportWalletSelection } from './pages/importWalletSelection';
import { ApproveAppRequest } from './pages/messages/ApproveAppRequest';
import { QRCodePage } from './pages/qrcode';
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
import { RecoveryPhraseVerify } from './pages/settings/privacy/walletsAndKeys/recoveryPhrase/recoveryPhraseVerify';
import { RecoveryPhraseWarning } from './pages/settings/privacy/walletsAndKeys/recoveryPhrase/warning';
import { WalletDetails } from './pages/settings/privacy/walletsAndKeys/walletDetails';
import { WalletsAndKeys } from './pages/settings/privacy/walletsAndKeys/walletsAndKeys';
import { Settings } from './pages/settings/settings';
import { Transactions } from './pages/settings/transactions';
import { Sign } from './pages/sign';
import { Swap } from './pages/swap';
import { Unlock } from './pages/unlock';
import { WalletReady } from './pages/walletReady';
import { WalletSwitcher } from './pages/walletSwitcher';
import { AddWallet } from './pages/walletSwitcher/addWallet';
import { ChooseWalletGroup } from './pages/walletSwitcher/chooseWalletGroup';
import { NewImportWallet } from './pages/walletSwitcher/newImportWallet';
import { NewImportWalletSelection } from './pages/walletSwitcher/newImportWalletSelection';
import { NewWatchWallet } from './pages/walletSwitcher/newWatchWallet';
import { Wallets } from './pages/wallets';
import { WatchWallet } from './pages/watchWallet';
import { Welcome } from './pages/welcome';
import { ROUTES } from './urls';
import { getInputIsFocused } from './utils/activeElement';
import { simulateTab } from './utils/simulateTab';

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
    background: FullScreenBackground,
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
        title={i18n.t('connected_apps.title')}
        protectedRoute
      >
        <ConnectedApps />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.WELCOME,
    element: (
      <AnimatedRoute
        direction="upRight"
        protectedRoute={['NEW']}
        accentColor={false}
      >
        <Welcome />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.READY,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['READY']}
        accentColor={false}
      >
        <WalletReady />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT_OR_CONNECT,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <ImportOrConnect />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW', 'READY']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <ImportWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__SEED,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW', 'READY']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <ImportWalletViaSeed />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__PRIVATE_KEY,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW', 'READY']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <ImportWalletViaPrivateKey />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.HW_CHOOSE,
    element: (
      <AnimatedRoute
        protectedRoute={['NEW', 'READY']}
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('hw.choose_title')}
        background="surfaceSecondary"
      >
        <ChooseHW />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.HW_LEDGER,
    element: (
      <AnimatedRoute
        protectedRoute={['NEW', 'READY']}
        direction="right"
        navbar
        navbarIcon="arrow"
        background="surfaceSecondary"
      >
        <ConnectLedger />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.HW_TREZOR,
    element: (
      <AnimatedRoute
        protectedRoute={['NEW', 'READY']}
        direction="up"
        navbar
        background="surfaceSecondary"
      >
        <ConnectTrezor />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.HW_WALLET_LIST,
    element: (
      <AnimatedRoute
        protectedRoute={['NEW', 'READY']}
        direction="right"
        navbar
        navbarIcon="arrow"
        background="surfaceSecondary"
        accentColor={false}
      >
        <WalletListHW />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.HW_SUCCESS,
    element: (
      <AnimatedRoute
        protectedRoute={['NEW', 'READY']}
        direction="upRight"
        background="surfaceSecondary"
      >
        <SuccessHW />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.WATCH,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <WatchWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <ImportWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.IMPORT__SELECT,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW']}
        accentColor={false}
      >
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
        accentColor={false}
      >
        <ImportWalletSelectionEdit onboarding />
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
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <SeedBackupPrompt />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEED_REVEAL,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute={['NEW']}
        navbar
        accentColor={false}
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
        direction="right"
        protectedRoute={['NEW']}
        navbar
        accentColor={false}
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
        direction="right"
        protectedRoute={['NEEDS_PASSWORD']}
        navbar
        navbarIcon="arrow"
        accentColor={false}
      >
        <CreatePassword />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.QR_CODE,
    element: (
      <AnimatedRoute
        direction="up"
        navbar
        navbarIcon="ex"
        protectedRoute
        background="surfaceSecondary"
      >
        <QRCodePage />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS,
    element: (
      <AnimatedRoute
        direction="upRight"
        navbar
        navbarIcon="ex"
        title={i18n.t('settings.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Settings />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY,
    element: (
      <AnimatedRoute
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
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__AUTOLOCK,
    element: (
      <AnimatedRoute
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
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__CHANGE_PASSWORD,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute
        background="surfaceSecondary"
      >
        <ChangePassword />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS,
    element: (
      <AnimatedRoute
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
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS,
    element: (
      <AnimatedRoute
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
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY_WARNING,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        background="surfaceSecondary"
        protectedRoute
      >
        <PrivateKeyWarning />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        background="surfaceSecondary"
        protectedRoute
      >
        <PrivateKey />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_WARNING,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        background="surfaceSecondary"
        protectedRoute
      >
        <RecoveryPhraseWarning />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="ex"
        background="surfaceSecondary"
        protectedRoute
      >
        <RecoveryPhrase />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_VERIFY,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="ex"
        background="surfaceSecondary"
        protectedRoute
      >
        <RecoveryPhraseVerify />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__TRANSACTIONS,
    element: (
      <AnimatedRoute
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
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SETTINGS__CURRENCY,
    element: (
      <AnimatedRoute
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
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SEND,
    element: (
      <AnimatedRoute direction="up" title={i18n.t('send.title')} protectedRoute>
        <Send />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.SWAP,
    element: (
      <AnimatedRoute direction="up" title={i18n.t('swap.title')} protectedRoute>
        <Swap />
      </AnimatedRoute>
    ),
    background:
      process.env.IS_TESTING === 'true' ? undefined : FullScreenBackground,
  },
  {
    path: ROUTES.SIGN,
    element: (
      <AnimatedRoute
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
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('wallets.title')}
        protectedRoute
      >
        <Wallets />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.WALLET_SWITCHER,
    element: (
      <AnimatedRoute
        direction="upRight"
        navbar
        navbarIcon="ex"
        title={i18n.t('wallets.title')}
        protectedRoute
        background="surfacePrimaryElevated"
      >
        <WalletSwitcher />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.ADD_WALLET,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('add_wallet.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <AddWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.CHOOSE_WALLET_GROUP,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <ChooseWalletGroup />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.NEW_WATCH_WALLET,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewWatchWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.NEW_IMPORT_WALLET,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewImportWallet />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.NEW_IMPORT_WALLET_SELECTION,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        protectedRoute
        background="surfaceSecondary"
      >
        <NewImportWalletSelection />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
  {
    path: ROUTES.NEW_IMPORT_WALLET_SELECTION_EDIT,
    element: (
      <AnimatedRoute
        direction="right"
        protectedRoute
        background="surfaceSecondary"
      >
        <ImportWalletSelectionEdit />
      </AnimatedRoute>
    ),
    background: FullScreenBackground,
  },
];

const matchingRoute = (pathName: string) => {
  const routeMatch = matchRoutes(ROUTE_DATA, pathName);
  const match = routeMatch?.[0].route;
  return match;
};

export function Routes({ children }: React.PropsWithChildren) {
  const location = useLocation();
  React.useEffect(() => {
    // need to wait a tick for the page to render
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
        {children}
      </RoutesContainer>
    </Box>
  );
}

function CurrentRoute(props: { pathname: string }) {
  const match = matchingRoute(props.pathname);
  const { state } = useLocation();
  const element = match?.element;
  const currentDirection = state?.direction ?? element?.props.direction;

  useGlobalShortcuts();

  if (!element) {
    // error UI here probably
    return null;
  }
  const direction = currentDirection;
  const navbarIcon = state?.navbarIcon ?? element?.props.navbarIcon;

  return (
    <AnimatePresence key={props.pathname} mode="popLayout">
      {React.cloneElement(element, {
        key: props.pathname,
        direction,
        navbarIcon,
      })}
    </AnimatePresence>
  );
}

const useGlobalShortcuts = () => {
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      // prevent scrolling with space
      if (e.key === shortcuts.global.OPEN_CONTEXT_MENU.key) {
        if (!getInputIsFocused()) {
          e.preventDefault();
        }
      }

      // traverse tabIndex with arrow keys
      if (!e.altKey) {
        if (e.key === shortcuts.global.DOWN.key) {
          e.preventDefault();
          simulateTab(true);
        }
        if (e.key === shortcuts.global.UP.key) {
          e.preventDefault();
          simulateTab(false);
        }
      }

      if (e.key === shortcuts.global.TAB.key) {
        e.preventDefault();
        simulateTab(!e.shiftKey);
      }
    },
  });
};
