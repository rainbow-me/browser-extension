import { useHotkeys as _useHotkeys } from 'react-hotkeys-hook';

import defaults from './defaults.json';

export { HotkeysProvider } from 'react-hotkeys-hook';

export enum Scope {
  Global = '*',
  Home = 'home',
}

export enum Hotkey {
  ConnectedApps = 'connected_apps',
  CopyAddress = 'copy_address',
  Lock = 'lock',
  NetworkSwitcher = 'network_switcher',
  Profile = 'profile',
  Send = 'send',
  Settings = 'settings',
  Swap = 'swap',
  WalletSwitcher = 'wallet_switcher',
}

export const useHotkeys = (
  scope: Scope,
  actions: {
    [key in Hotkey]?: () => void;
  },
) => {
  for (const [key, callback] of Object.entries(actions)) {
    const hotkey = (defaults[scope] as { [key: string]: string })[key];
    _useHotkeys(hotkey, callback, { scopes: [scope] });
  }
};
