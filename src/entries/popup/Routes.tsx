import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import {
  Outlet,
  RouteObject,
  RouterProvider,
  createHashRouter,
  useLocation,
  useRouteError,
} from 'react-router-dom';

import { analytics } from '~/analytics';
import { screen } from '~/analytics/screen';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useErrorStore } from '~/core/state/error';
import { useNavRestorationStore } from '~/core/state/navRestoration';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import { Alert } from '~/design-system/components/Alert/Alert';
import { AnimatedRoute } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { BoxProps } from '~/design-system/components/Box/Box';

import { AppConnectionWatcher } from './components/AppConnection/AppConnectionWatcher';
import { CommandK } from './components/CommandK/CommandK';
import { FullScreenBackground } from './components/FullScreen/FullScreenBackground';
import { ImportWalletSelectionEdit } from './components/ImportWallet/ImportWalletSelectionEdit';
import { ImportWalletViaPrivateKey } from './components/ImportWallet/ImportWalletViaPrivateKey';
import { ImportWalletViaSeed } from './components/ImportWallet/ImportWalletViaSeed';
import { Toast } from './components/Toast/Toast';
import { UnsupportedBrowserSheet } from './components/UnsupportedBrowserSheet';
import { WindowStroke } from './components/WindowStroke/WindowStroke';
import { useCommandKShortcuts } from './hooks/useCommandKShortcuts';
import useKeyboardAnalytics from './hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useRainbowNavigate } from './hooks/useRainbowNavigate';
import { Buy } from './pages/buy';
import { CreatePassword } from './pages/createPassword';
import { Home } from './pages/home';
import { ActivityDetails } from './pages/home/Activity/ActivityDetails';
import { ConnectedApps } from './pages/home/ConnectedApps';
import { TokenDetails } from './pages/home/TokenDetails/TokenDetails';
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
import { SettingsNetworksCustomRPC } from './pages/settings/customRpc';
import { Language } from './pages/settings/language';
import { SettingsNetworks } from './pages/settings/networks';
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
import { zIndexes } from './utils/zIndexes';

const ChildRoute = (
  props: React.PropsWithChildren &
    Pick<BoxProps, 'background'> &
    Pick<BoxProps, 'position'>,
) => (
  <Box
    position={props.position}
    background={props.background}
    style={{ ...POPUP_DIMENSIONS, zIndex: zIndexes.CHILD_ROUTE }}
  >
    {props.children}
  </Box>
);

const ROUTE_DATA = [
  {
    path: ROUTES.ROOT,
    index: true,
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
        <Outlet />
      </AnimatedRoute>
    ),
    children: [
      {
        path: ROUTES.TOKEN_DETAILS(':uniqueId'),
        element: (
          <ChildRoute background="surfacePrimaryElevated" position="absolute">
            <AnimatedRoute
              background="surfacePrimaryElevated"
              direction="left"
              protectedRoute
            >
              <TokenDetails />
            </AnimatedRoute>
          </ChildRoute>
        ),
      },
      {
        path: ROUTES.ACTIVITY_DETAILS(':chainId', ':hash'),
        element: (
          <ChildRoute>
            <ActivityDetails />
          </ChildRoute>
        ),
      },
    ],
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
  },
  {
    path: ROUTES.UNLOCK,
    element: (
      <AnimatedRoute direction="base" protectedRoute={['LOCKED']}>
        <Unlock />
      </AnimatedRoute>
    ),
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
  },
  {
    path: ROUTES.SETTINGS__NETWORKS,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('settings.networks.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <SettingsNetworks />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SETTINGS__NETWORKS__CUSTOM_RPC,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('settings.networks.custom_rpc.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <SettingsNetworksCustomRPC />
      </AnimatedRoute>
    ),
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
  },
  {
    path: ROUTES.SETTINGS__LANGUAGE,
    element: (
      <AnimatedRoute
        direction="right"
        navbar
        navbarIcon="arrow"
        title={i18n.t('settings.language.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Language />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SEND,
    element: (
      <AnimatedRoute direction="up" title={i18n.t('send.title')} protectedRoute>
        <Send />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.SWAP,
    element: (
      <AnimatedRoute direction="up" title={i18n.t('swap.title')} protectedRoute>
        <Swap />
      </AnimatedRoute>
    ),
  },
  {
    path: ROUTES.BRIDGE,
    element: (
      <AnimatedRoute
        direction="up"
        title={i18n.t('bridge.title')}
        protectedRoute
      >
        <Swap bridge />
      </AnimatedRoute>
    ),
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
  },
  {
    path: ROUTES.BUY,
    element: (
      <AnimatedRoute
        direction="upRight"
        navbar
        navbarIcon="ex"
        title={i18n.t('buy.title')}
        protectedRoute
        background="surfaceSecondary"
      >
        <Buy />
      </AnimatedRoute>
    ),
  },
] satisfies RouteObject[];

const RootLayout = () => {
  const { pathname, state } = useLocation();
  const { setLastPage, shouldRestoreNavigation } = useNavRestorationStore();

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  React.useEffect(() => {
    analytics.screen(screen[pathname], { path: pathname });
    if (!shouldRestoreNavigation) {
      setLastPage(pathname);
    }
  }, [pathname, setLastPage, shouldRestoreNavigation]);

  useGlobalShortcuts();
  useCommandKShortcuts();

  return (
    <FullScreenBackground>
      <AnimatePresence mode="popLayout">
        <div>
          <Outlet
            // skip the page transition with a unique state.skipTransitionOnRoute
            // the animate presence only runs on the <Outlet /> when it's key changes
            key={state?.skipTransitionOnRoute || pathname}
          />
        </div>
      </AnimatePresence>
      <CommandK />
      <Toast />
      <Alert />
      <WindowStroke />
      <UnsupportedBrowserSheet />
      <AppConnectionWatcher />
    </FullScreenBackground>
  );
};

const router = createHashRouter([
  { element: <RootLayout />, children: ROUTE_DATA, errorElement: <Rerouter /> },
]);

export function Routes() {
  return <RouterProvider router={router} />;
}

const useGlobalShortcuts = () => {
  const { trackNavigation } = useKeyboardAnalytics();
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
          trackNavigation({
            key: shortcuts.global.DOWN.display,
            type: 'navigate.down',
          });
          e.preventDefault();
          simulateTab(true);
        }
        if (e.key === shortcuts.global.UP.key) {
          trackNavigation({
            key: shortcuts.global.UP.display,
            type: 'navigate.up',
          });
          e.preventDefault();
          simulateTab(false);
        }
      }

      if (e.key === shortcuts.global.TAB.key) {
        trackNavigation({
          key: shortcuts.global.TAB.display,
          type: e.shiftKey ? 'navigate.up' : 'navigate.down',
        });
        e.preventDefault();
        simulateTab(!e.shiftKey);
      }
    },
  });
};

function Rerouter() {
  const error = useRouteError() as Error;
  const navigate = useRainbowNavigate();
  const { setError } = useErrorStore();

  React.useEffect(() => {
    setError(error);
    navigate(ROUTES.HOME, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
