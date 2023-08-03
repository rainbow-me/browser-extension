import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
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
  | 'customGasMenu.open'
  | 'gasMenu.open'
  | 'global.switchWallet'
  | 'home.copyAddress'
  | 'home.dismissSheet'
  | 'home.goToConnectedApps'
  | 'home.goToProfile'
  | 'home.goToSend'
  | 'home.goToSettings'
  | 'home.goToSwap'
  | 'home.goToWallets'
  | 'home.goToQr'
  | 'home.lock'
  | 'home.openMoreMenu'
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
  | 'switchNetworkMenu.toggle'
  | 'tokens.goToSend'
  | 'tokens.goToSwap'
  | 'tokens.refresh'
  | 'tokens.viewAssetOnExplorer'
  | 'walletSwitcher.search';

export default function useKeyboardAnalytics() {
  const { pathname } = useLocation();
  const currentScreen = screen[pathname];
  const trackNavigation = useCallback(
    ({ key }: { key: string; type: KeyboardEventDescription }) => {
      analytics.track(event.keyboardNavigationTriggered, {
        key,
        screen: currentScreen,
      });
    },
    [currentScreen],
  );
  const trackShortcut = useCallback(
    ({ key, type }: { key: string; type: KeyboardEventDescription }) => {
      analytics.track(event.keyboardShortcutTriggered, {
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
