import { useCallback } from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { truncateAddress } from '~/core/utils/address';
import { getProfileUrl, goToNewTab } from '~/core/utils/tabs';

import { triggerToast } from '../components/Toast/Toast';
import * as wallet from '../handlers/wallet';
import { ROUTES } from '../urls';
import {
  appConnectionMenuIsActive,
  getInputIsFocused,
} from '../utils/activeElement';
import { clickHeaderRight } from '../utils/clickHeader';

import { useActiveTab } from './useActiveTab';
import { useAppMetadata } from './useAppMetadata';
import { useAppSession } from './useAppSession';
import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useNavigateToSwaps } from './useNavigateToSwaps';
import { useRainbowNavigate } from './useRainbowNavigate';

export function useHomeShortcuts() {
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address });
  const { selectedToken } = useSelectedTokenStore();
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet } = useCurrentHomeSheetStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const navigateToSwaps = useNavigateToSwaps();
  const { url } = useActiveTab();
  const { appHost } = useAppMetadata({ url });
  const { disconnectSession } = useAppSession({ host: appHost });

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
      host: appHost,
    });
  }, [appHost, address, disconnectSession]);

  const openProfile = useCallback(
    () =>
      goToNewTab({
        url: getProfileUrl(ensName ?? address),
      }),
    [address, ensName],
  );

  const navigate = useRainbowNavigate();
  const handleHomeShortcuts = useCallback(
    (e: KeyboardEvent) => {
      const { key } = e;
      const inputIsFocused = getInputIsFocused();
      if (inputIsFocused) return;
      switch (key) {
        case shortcuts.home.COPY_ADDRESS.key:
          trackShortcut({
            key: shortcuts.home.COPY_ADDRESS.display,
            type: 'home.copyAddress',
          });
          handleCopy();
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
          navigate(ROUTES.SEND);
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
          trackShortcut({
            key: shortcuts.home.GO_TO_PROFILE.display,
            type: 'home.goToProfile',
          });
          openProfile();
          break;
        case shortcuts.home.GO_TO_WALLETS.key:
          if (!appConnectionMenuIsActive()) {
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
        case shortcuts.home.OPEN_MORE_MENU.key:
          trackShortcut({
            key: shortcuts.home.OPEN_MORE_MENU.display,
            type: 'home.openMoreMenu',
          });
          clickHeaderRight();
          break;
        case shortcuts.home.DISCONNECT_APP.key:
          if (!appConnectionMenuIsActive()) {
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
      disconnectFromApp,
      handleCopy,
      navigate,
      navigateToSwaps,
      openProfile,
      trackShortcut,
    ],
  );
  useKeyboardShortcut({
    condition: getHomeShortcutsAreActive,
    handler: handleHomeShortcuts,
  });
}
