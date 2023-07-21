import React from 'react';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import * as state from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_URL, getProfileUrl, goToNewTab } from '~/core/utils/tabs';
import { SymbolName } from '~/design-system/styles/designTokens';
import { useNavigateToSwaps } from '~/entries/popup/hooks/useNavigateToSwaps';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { triggerToast } from '../Toast/Toast';

export interface ShortcutCommand {
  action?: () => void;
  downrank?: boolean;
  name: string;
  hideForWatchedWallets?: boolean;
  hideWhenFullScreen?: boolean;
  id?: string;
  searchTags?: string[];
  shortcut?: { display: string; key: string; modifier?: string };
  shouldRemainOnActiveRoute?: boolean;
  symbol: SymbolName;
  symbolSize?: number;
  to?: string;
}

interface ShortcutOverride {
  [key: string]: Partial<ShortcutCommand>;
}

interface ShortcutInfo {
  [key: string]: ShortcutCommand;
}

const missingDefinitionError = '[missing';

const getShortcutName = (key: string) => {
  const lookupKey = `command_k.shortcuts.names.${key}`;
  const result = i18n.t(lookupKey);
  return result.startsWith(missingDefinitionError) ? '' : result;
};

const getSearchTags = (key: string) => {
  const lookupKey = `command_k.shortcuts.search_tags.${key}`;
  const tagString = i18n.t(lookupKey);
  return tagString.startsWith(missingDefinitionError)
    ? []
    : tagString.split(/,\s*/);
};

export const staticShortcutInfo: ShortcutInfo = {
  send: {
    hideForWatchedWallets: true,
    name: getShortcutName('send'),
    shortcut: shortcuts.home.GO_TO_SEND,
    symbol: 'paperplane.fill',
    symbolSize: 14.5,
    to: ROUTES.SEND,
  },
  swap: {
    hideForWatchedWallets: true,
    name: getShortcutName('swap'),
    searchTags: getSearchTags('swap'),
    shortcut: shortcuts.home.GO_TO_SWAP,
    symbol: 'arrow.triangle.swap',
    symbolSize: 15.5,
  },
  copyAddress: {
    name: getShortcutName('copy_address'),
    shortcut: shortcuts.home.COPY_ADDRESS,
    shouldRemainOnActiveRoute: true,
    symbol: 'square.on.square',
    symbolSize: 14.5,
  },
  viewNFTs: {
    name: getShortcutName('view_nfts'),
    searchTags: getSearchTags('view_nfts'),
    shortcut: shortcuts.home.GO_TO_PROFILE,
    shouldRemainOnActiveRoute: true,
    symbol: 'sparkle',
    symbolSize: 15,
  },
  switchWallets: {
    name: getShortcutName('switch_wallets'),
    shortcut: shortcuts.home.GO_TO_WALLETS,
    symbol: 'person.crop.rectangle.stack.fill',
    symbolSize: 16,
    to: ROUTES.WALLET_SWITCHER,
  },
  settings: {
    name: getShortcutName('settings'),
    searchTags: getSearchTags('settings'),
    shortcut: shortcuts.home.GO_TO_SETTINGS,
    symbol: 'gearshape.fill',
    symbolSize: 15,
    to: ROUTES.SETTINGS,
  },
  addWallet: {
    name: getShortcutName('add_wallet'),
    searchTags: getSearchTags('add_wallet'),
    symbol: 'plus.app.fill',
    symbolSize: 14,
  },
  watchWallet: {
    name: getShortcutName('watch_wallet'),
    symbol: 'eyes.inverse',
    symbolSize: 16,
  },
  hideBalances: {
    name: getShortcutName('hide_balances'),
    shouldRemainOnActiveRoute: true,
    symbol: 'asterisk',
    symbolSize: 15,
  },
  walletsAndKeys: {
    downrank: true,
    name: getShortcutName('wallets_and_keys'),
    searchTags: getSearchTags('wallets_and_keys'),
    symbol: 'key.fill',
    symbolSize: 16.5,
  },
  viewFullScreen: {
    hideWhenFullScreen: true,
    name: getShortcutName('view_full_screen'),
    symbol: 'arrow.up.left.and.arrow.down.right',
    symbolSize: 14,
  },
};

const compileShortcutList = (
  isFullScreen: boolean,
  isWatchedWallet: boolean,
  overrides: ShortcutOverride,
  staticInfo: ShortcutInfo,
): ShortcutCommand[] => {
  return Object.keys(staticInfo)
    .filter((key) => {
      if (
        (isWatchedWallet && staticInfo[key]?.hideForWatchedWallets) ||
        (isFullScreen && staticInfo[key]?.hideWhenFullScreen)
      ) {
        return false;
      }
      return true;
    })
    .map((key) => ({
      id: key,
      ...staticInfo[key],
      ...overrides[key],
      onClick: overrides[key]?.action,
    }));
};

export const useCommands = () => {
  const { currentAddress: address } = state.useCurrentAddressStore();
  const { currentTheme } = useCurrentThemeStore();
  const { data: ensName } = useEnsName({ address });
  const { featureFlags } = useFeatureFlagsStore();
  const isFullScreen = useIsFullScreen();
  const navigate = useRainbowNavigate();
  const navigateToSwaps = useNavigateToSwaps();
  const { isWatchingWallet } = useWallets();

  const { hideAssetBalances, setHideAssetBalances } =
    useHideAssetBalancesStore();

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, [address]);

  const handleToggleHiddenBalances = React.useCallback(() => {
    const status = hideAssetBalances ? 'revealed' : 'hidden';
    triggerToast({
      title: i18n.t(`command_k.hide_balances_toast.title_${status}`),
      description: i18n.t(
        `command_k.hide_balances_toast.description_${status}`,
      ),
    });
    setHideAssetBalances(!hideAssetBalances);
  }, [hideAssetBalances, setHideAssetBalances]);

  const openProfile = React.useCallback(
    () => goToNewTab({ url: getProfileUrl(ensName ?? address) }),
    [address, ensName],
  );

  const shortcutOverrides: ShortcutOverride = React.useMemo(
    () => ({
      swap: {
        action: navigateToSwaps,
      },
      copyAddress: {
        action: handleCopy,
      },
      viewNFTs: {
        action: openProfile,
      },
      addWallet: {
        action: () =>
          navigate(ROUTES.ADD_WALLET, {
            state: { direction: 'upRight', navbarIcon: 'ex' },
          }),
      },
      watchWallet: {
        action: () =>
          navigate(ROUTES.NEW_WATCH_WALLET, {
            state: { direction: 'up', navbarIcon: 'ex' },
          }),
        symbol: currentTheme === 'dark' ? 'eyes.inverse' : 'eyes',
      },
      hideBalances: {
        action: handleToggleHiddenBalances,
        searchTags: hideAssetBalances
          ? getSearchTags('hide_balances_hidden')
          : getSearchTags('hide_balances_revealed'),
      },
      walletsAndKeys: {
        action: () =>
          navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS, {
            state: { direction: 'upRight', navbarIcon: 'ex' },
          }),
      },
      viewFullScreen: {
        action: () => goToNewTab({ url: POPUP_URL }),
      },
    }),
    [
      currentTheme,
      handleCopy,
      handleToggleHiddenBalances,
      hideAssetBalances,
      navigate,
      navigateToSwaps,
      openProfile,
    ],
  );

  const shortcutList = React.useMemo(
    () =>
      compileShortcutList(
        isFullScreen,
        (isWatchingWallet ?? false) && !featureFlags.full_watching_wallets,
        shortcutOverrides,
        staticShortcutInfo,
      ),
    [
      isFullScreen,
      isWatchingWallet,
      featureFlags.full_watching_wallets,
      shortcutOverrides,
    ],
  );

  return { shortcutList };
};
