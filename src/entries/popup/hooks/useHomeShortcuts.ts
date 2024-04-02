import { useCallback, useMemo } from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useSelectedNftStore } from '~/core/state/selectedNft';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { truncateAddress } from '~/core/utils/address';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { triggerToast } from '../components/Toast/Toast';
import * as wallet from '../handlers/wallet';
import { ROUTES } from '../urls';
import {
  appConnectionMenuIsActive,
  appConnectionSwitchWalletsPromptIsActive,
  getActiveModal,
  getInputIsFocused,
} from '../utils/activeElement';
import {
  clickHeaderLeft,
  clickHeaderRight,
  clickTabBar,
} from '../utils/clickHeader';

import { useActiveTab } from './useActiveTab';
import { useAppSession } from './useAppSession';
import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useNavigateToSwaps } from './useNavigateToSwaps';
import { useRainbowNavigate } from './useRainbowNavigate';
import { useWallets } from './useWallets';

export function useHomeShortcuts() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });
  const { selectedToken } = useSelectedTokenStore();
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet } = useCurrentHomeSheetStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const navigateToSwaps = useNavigateToSwaps();
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });
  const { disconnectSession } = useAppSession({ host: dappMetadata?.appHost });
  const { featureFlags } = useFeatureFlagsStore();
  const { isWatchingWallet } = useWallets();
  const { testnetMode, setTestnetMode } = useTestnetModeStore();
  const { developerToolsEnabled } = useDeveloperToolsEnabledStore();
  const { selectedNft } = useSelectedNftStore();

  const allowSend = useMemo(
    () => !isWatchingWallet || featureFlags.full_watching_wallets,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const alertWatchingWallet = useCallback(() => {
    triggerAlert({ text: i18n.t('alert.wallet_watching_mode') });
  }, []);

  const getHomeShortcutsAreActive = useCallback(() => {
    return sheet === 'none' && !selectedTransaction && !selectedToken;
  }, [sheet, selectedToken, selectedTransaction]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address]);

  const disconnectFromApp = useCallback(() => {
    disconnectSession({
      address: address,
      host: dappMetadata?.appHost || '',
    });
  }, [dappMetadata?.appHost, address, disconnectSession]);

  const openProfile = useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  const handleTestnetMode = useCallback(() => {
    if (developerToolsEnabled || testnetMode) {
      setTestnetMode(!testnetMode);
    }
  }, [setTestnetMode, testnetMode, developerToolsEnabled]);

  const navigate = useRainbowNavigate();
  const handleHomeShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const activeAppConnectionMenu = appConnectionMenuIsActive();
      const activeAppWalletSwitcher =
        appConnectionSwitchWalletsPromptIsActive();
      const inputIsFocused = getInputIsFocused();
      const isModal = getActiveModal();
      if (inputIsFocused) return;
      if (isModal) return;
      switch (e.key) {
        case shortcuts.home.BUY.key:
          trackShortcut({
            key: shortcuts.home.BUY.display,
            type: 'home.goToBuy',
          });
          navigate(ROUTES.BUY);
          break;
        case shortcuts.home.COPY_ADDRESS.key:
          if (!selectedNft && !selectedToken) {
            trackShortcut({
              key: shortcuts.home.COPY_ADDRESS.display,
              type: 'home.copyAddress',
            });
            handleCopy();
          }
          break;
        case shortcuts.home.GO_TO_CONNECTED_APPS.key:
          trackShortcut({
            key: shortcuts.home.GO_TO_CONNECTED_APPS.display,
            type: 'home.goToConnectedApps',
          });
          navigate(ROUTES.CONNECTED);
          break;
        case shortcuts.home.GO_TO_SEND.key:
          trackShortcut({
            key: shortcuts.home.GO_TO_SEND.display,
            type: 'home.goToSend',
          });
          if (allowSend) {
            navigate(ROUTES.SEND);
          } else {
            alertWatchingWallet();
          }
          break;
        case shortcuts.home.GO_TO_SETTINGS.key:
          trackShortcut({
            key: shortcuts.home.GO_TO_SETTINGS.display,
            type: 'home.goToSettings',
          });
          navigate(ROUTES.SETTINGS);
          break;
        case shortcuts.home.GO_TO_SWAP.key:
          trackShortcut({
            key: shortcuts.home.GO_TO_SWAP.display,
            type: 'home.goToSwap',
          });
          navigateToSwaps();
          break;
        case shortcuts.home.GO_TO_PROFILE.key:
          if (!selectedToken) {
            trackShortcut({
              key: shortcuts.home.GO_TO_PROFILE.display,
              type: 'home.goToProfile',
            });
            openProfile();
          }
          break;
        case shortcuts.home.GO_TO_WALLETS.key:
          if (!activeAppConnectionMenu) {
            trackShortcut({
              key: shortcuts.home.GO_TO_WALLETS.display,
              type: 'home.goToWallets',
            });
            navigate(ROUTES.WALLET_SWITCHER);
          }
          break;
        case shortcuts.home.GO_TO_QR.key:
          trackShortcut({
            key: shortcuts.home.GO_TO_QR.display,
            type: 'home.goToQr',
          });
          navigate(ROUTES.QR_CODE);
          break;
        case shortcuts.home.LOCK.key:
          trackShortcut({
            key: shortcuts.home.COPY_ADDRESS.display,
            type: 'home.copyAddress',
          });
          wallet.lock();
          break;
        case shortcuts.home.TESTNET_MODE.key:
          trackShortcut({
            key: shortcuts.home.TESTNET_MODE.display,
            type: 'home.testnetMode',
          });
          // in order to close dropdown menus
          clickTabBar();
          handleTestnetMode();
          break;
        case shortcuts.home.OPEN_MORE_MENU.key:
          if (!activeAppWalletSwitcher) {
            trackShortcut({
              key: shortcuts.home.OPEN_MORE_MENU.display,
              type: 'home.openMoreMenu',
            });
            clickHeaderRight();
          }
          break;
        case shortcuts.home.OPEN_APP_CONNECTION_MENU.key:
          if (!activeAppConnectionMenu && !activeAppWalletSwitcher) {
            trackShortcut({
              key: shortcuts.home.OPEN_APP_CONNECTION_MENU.display,
              type: 'home.openAppConnectionMenu',
            });
            clickHeaderLeft();
          }
          break;
        case shortcuts.home.DISCONNECT_APP.key:
          if (!activeAppConnectionMenu) {
            trackShortcut({
              key: shortcuts.home.DISCONNECT_APP.display,
              type: 'home.disconnectApp',
            });
            disconnectFromApp();
          }
          break;
      }
    },
    [
      trackShortcut,
      navigate,
      selectedNft,
      selectedToken,
      allowSend,
      navigateToSwaps,
      handleTestnetMode,
      handleCopy,
      alertWatchingWallet,
      openProfile,
      disconnectFromApp,
    ],
  );
  useKeyboardShortcut({
    condition: getHomeShortcutsAreActive,
    handler: handleHomeShortcuts,
  });
}
