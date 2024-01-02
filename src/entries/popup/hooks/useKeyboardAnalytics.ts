import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { EventProperties, event } from '~/analytics/event';
import { screen } from '~/analytics/screen';

export type KeyboardEventDescription =
  | 'activity.cancelTransaction'
  | 'activity.speedUpTransaction'
  | 'activity.copyTransactionAddress'
  | 'activity.viewTransactionOnExplorer'
  | 'alert.dismiss'
  | 'chooseWallet.create'
  | 'chooseWallet.select'
  | 'connect.openWalletSwitcher'
  | 'connect.switchWallet'
  | 'connect.cancel'
  | 'request.cancel'
  | 'request.accept'
  | 'customGasMenu.open'
  | 'gasMenu.open'
  | 'global.switchWallet'
  | 'home.copyAddress'
  | 'home.dismissSheet'
  | 'home.disconnectApp'
  | 'home.goToBuy'
  | 'home.goToConnectedApps'
  | 'home.goToProfile'
  | 'home.goToSend'
  | 'home.goToSettings'
  | 'home.goToSwap'
  | 'home.goToWallets'
  | 'home.goToQr'
  | 'home.lock'
  | 'home.testnetMode'
  | 'home.openMoreMenu'
  | 'home.openAppConnectionMenu'
  | 'home.switchTab'
  | 'moreInfoButton.dismiss'
  | 'navbar.goBack'
  | 'navigate.down'
  | 'navigate.up'
  | 'radix.switchMenu.dismiss'
  | 'send.cancel'
  | 'send.copyContactAddress'
  | 'send.editContact'
  | 'send.focusAsset'
  | 'send.focusToAddress'
  | 'send.openContactMenu'
  | 'send.setMax'
  | 'send.switchCurrency'
  | 'swap.flipAssets'
  | 'swap.focusAssetToBuy'
  | 'swap.focusAssetToSell'
  | 'swap.setMax'
  | 'switchNetworkMenu.disconnect'
  | 'switchNetworkMenu.dismiss'
  | 'switchNetworkMenu.selectChain'
  | 'switchNetworkMenu.switchWallets'
  | 'switchNetworkMenu.toggle'
  | 'tokens.goToSend'
  | 'tokens.goToSwap'
  | 'tokens.goToBridge'
  | 'tokens.refresh'
  | 'tokens.viewAssetOnExplorer'
  | 'walletSwitcher.search';

const analyticsTrack = <T extends keyof EventProperties>(
  event: T,
  params?: EventProperties[T],
) =>
  import('~/analytics').then(({ analytics }) => analytics.track(event, params));

export default function useKeyboardAnalytics() {
  const { pathname } = useLocation();
  const currentScreen = screen[pathname];

  const trackNavigation = useCallback(
    async ({ key }: { key: string; type: KeyboardEventDescription }) => {
      analyticsTrack(event.keyboardNavigationTriggered, {
        key,
        screen: currentScreen,
      });
    },
    [currentScreen],
  );
  const trackShortcut = useCallback(
    async ({ key, type }: { key: string; type: KeyboardEventDescription }) => {
      analyticsTrack(event.keyboardShortcutTriggered, {
        key,
        screen: currentScreen,
        type,
      });
    },
    [currentScreen],
  );

  return {
    trackNavigation,
    trackShortcut,
  };
}
