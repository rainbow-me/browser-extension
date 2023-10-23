import React from 'react';
import { To } from 'react-router-dom';
import { Address, useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { useSavedEnsNames } from '~/core/state/savedEnsNames';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { getBlockExplorerHostForChain } from '~/core/utils/chains';
import {
  POPUP_URL,
  getExplorerUrl,
  getProfileUrl,
  goToNewTab,
} from '~/core/utils/tabs';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import * as wallet from '~/entries/popup/handlers/wallet';
import { useNavigateToSwaps } from '~/entries/popup/hooks/useNavigateToSwaps';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { useBrowser } from '../../hooks/useBrowser';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { triggerToast } from '../Toast/Toast';

import {
  ENSOrAddressSearchItem,
  SearchItem,
  SearchItemType,
  ShortcutSearchItem,
  TokenSearchItem,
  WalletSearchItem,
} from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { actionLabels } from './references';
import { CommandKPageState } from './useCommandKNavigation';
import { useSearchableENSorAddress } from './useSearchableENSOrAddress';
import { useSearchableTokens } from './useSearchableTokens';
import { useSearchableWallets } from './useSearchableWallets';

interface CommandOverride {
  [key: string]: Partial<ShortcutSearchItem>;
}

interface CommandInfo {
  [key: string]: ShortcutSearchItem;
}

const missingDefinitionError = '[missing';
const getCommandName = (key: string) => {
  const lookupKey = `command_k.commands.names.${key}`;
  const result = i18n.t(lookupKey);
  return result.startsWith(missingDefinitionError) ? '' : result;
};
const getSearchTags = (key: string) => {
  const lookupKey = `command_k.commands.search_tags.${key}`;
  const tagString = i18n.t(lookupKey);
  return tagString.startsWith(missingDefinitionError)
    ? []
    : tagString.split(/,\s*/);
};

export const staticCommandInfo: CommandInfo = {
  // PAGE: HOME
  send: {
    actionLabel: actionLabels.open,
    hideForWatchedWallets: true,
    name: getCommandName('send'),
    page: PAGES.HOME,
    shortcut: shortcuts.home.GO_TO_SEND,
    symbol: 'paperplane.fill',
    symbolSize: 14.5,
    to: ROUTES.SEND,
    type: SearchItemType.Shortcut,
  },
  swap: {
    actionLabel: actionLabels.open,
    hideForWatchedWallets: true,
    name: getCommandName('swap'),
    page: PAGES.HOME,
    searchTags: getSearchTags('swap'),
    shortcut: shortcuts.home.GO_TO_SWAP,
    symbol: 'arrow.triangle.swap',
    symbolSize: 15.5,
    type: SearchItemType.Shortcut,
  },
  myWallets: {
    actionLabel: actionLabels.view,
    name: getCommandName('my_wallets'),
    page: PAGES.HOME,
    searchTags: getSearchTags('my_wallets'),
    shortcut: shortcuts.home.GO_TO_WALLETS,
    symbol: 'person.crop.rectangle.stack.fill',
    symbolSize: 16,
    toPage: PAGES.MY_WALLETS,
    type: SearchItemType.Shortcut,
  },
  myTokens: {
    actionLabel: actionLabels.view,
    name: getCommandName('my_tokens'),
    page: PAGES.HOME,
    symbol: 'circlebadge.2.fill',
    symbolSize: 16.25,
    toPage: PAGES.MY_TOKENS,
    type: SearchItemType.Shortcut,
  },
  copyAddress: {
    name: getCommandName('copy_address'),
    page: PAGES.HOME,
    shortcut: shortcuts.home.COPY_ADDRESS,
    shouldRemainOnActiveRoute: true,
    symbol: 'square.on.square',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  viewNFTs: {
    actionLabel: actionLabels.openInNewTab,
    name: getCommandName('view_nfts'),
    page: PAGES.HOME,
    searchTags: getSearchTags('view_nfts'),
    shortcut: shortcuts.home.GO_TO_PROFILE,
    shouldRemainOnActiveRoute: true,
    symbol: 'sparkle',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  addWallet: {
    actionLabel: actionLabels.view,
    name: getCommandName('add_wallet'),
    page: PAGES.HOME,
    searchTags: getSearchTags('add_wallet'),
    symbol: 'plus.app.fill',
    symbolSize: 14,
    toPage: PAGES.ADD_WALLET,
    type: SearchItemType.Shortcut,
  },
  lock: {
    name: getCommandName('lock'),
    page: PAGES.HOME,
    shortcut: shortcuts.home.LOCK,
    symbol: 'lock.open.fill',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  testnet_mode: {
    name: getCommandName('testnet_mode'),
    page: PAGES.HOME,
    shortcut: shortcuts.home.TESTNET_MODE,
    symbol: 'sparkle',
    textIcon: '🕹',
    symbolSize: 15,
    to: ROUTES.SETTINGS__NETWORKS,
    type: SearchItemType.Shortcut,
  },
  connectedApps: {
    actionLabel: actionLabels.open,
    name: getCommandName('connected_apps'),
    page: PAGES.HOME,
    shortcut: shortcuts.home.GO_TO_CONNECTED_APPS,
    symbol: 'square.on.square.dashed',
    symbolSize: 15,
    to: ROUTES.CONNECTED,
    type: SearchItemType.Shortcut,
  },
  settings: {
    actionLabel: actionLabels.open,
    name: getCommandName('settings'),
    page: PAGES.HOME,
    searchTags: getSearchTags('settings'),
    shortcut: shortcuts.home.GO_TO_SETTINGS,
    symbol: 'gearshape.fill',
    symbolSize: 15,
    to: ROUTES.SETTINGS,
    type: SearchItemType.Shortcut,
  },
  myQRCode: {
    actionLabel: actionLabels.open,
    name: getCommandName('my_qr_code'),
    page: PAGES.HOME,
    shortcut: shortcuts.home.GO_TO_QR,
    symbol: 'person.fill.viewfinder',
    symbolSize: 15.5,
    to: ROUTES.QR_CODE,
    type: SearchItemType.Shortcut,
  },
  hideBalances: {
    name: getCommandName('hide_balances'),
    page: PAGES.HOME,
    searchTags: getSearchTags('hide_balances'),
    shouldRemainOnActiveRoute: true,
    symbol: 'asterisk',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  hideSmallBalances: {
    name: getCommandName('hide_small_balances'),
    page: PAGES.HOME,
    searchTags: getSearchTags('hide_small_balances'),
    shouldRemainOnActiveRoute: true,
    symbol: 'xmark.bin.fill',
    symbolSize: 16,
    type: SearchItemType.Shortcut,
  },
  walletsAndKeys: {
    actionLabel: actionLabels.open,
    downrank: true,
    name: getCommandName('wallets_and_keys'),
    page: PAGES.HOME,
    searchTags: getSearchTags('wallets_and_keys'),
    symbol: 'key.fill',
    symbolSize: 16.5,
    type: SearchItemType.Shortcut,
  },
  viewFullScreen: {
    actionLabel: actionLabels.openInNewTab,
    hideWhenFullScreen: true,
    name: getCommandName('view_full_screen'),
    page: PAGES.HOME,
    symbol: 'arrow.up.left.and.arrow.down.right',
    symbolSize: 14,
    type: SearchItemType.Shortcut,
  },

  // PAGE: ADD_WALLET
  createWallet: {
    actionLabel: actionLabels.open,
    name: getCommandName('create_wallet'),
    page: PAGES.ADD_WALLET,
    searchTags: getSearchTags('create_wallet'),
    symbol: 'plus.circle',
    symbolSize: 15.25,
    type: SearchItemType.Shortcut,
  },
  importWallet: {
    actionLabel: actionLabels.open,
    name: getCommandName('import_wallet'),
    page: PAGES.ADD_WALLET,
    searchTags: getSearchTags('import_wallet'),
    symbol: 'lock.rotation',
    symbolSize: 16.5,
    type: SearchItemType.Shortcut,
  },
  watchWallet: {
    actionLabel: actionLabels.open,
    downrank: true,
    name: getCommandName('watch_wallet'),
    page: PAGES.ADD_WALLET,
    searchTags: getSearchTags('watch_wallet'),
    symbol: 'eyes.inverse',
    symbolSize: 16,
    type: SearchItemType.Shortcut,
  },
  addHardwareWallet: {
    actionLabel: actionLabels.open,
    name: getCommandName('add_hardware_wallet'),
    page: PAGES.ADD_WALLET,
    searchTags: getSearchTags('add_hardware_wallet'),
    symbol: 'cable.connector',
    symbolSize: 16.75,
    type: SearchItemType.Shortcut,
  },

  // PAGE: TOKEN_DETAIL
  viewToken: {
    actionLabel: actionLabels.open,
    hideFromMainSearch: true,
    name: getCommandName('view_token'),
    page: PAGES.TOKEN_DETAIL,
    symbol: 'circlebadge.2.fill',
    symbolSize: 16.5,
    type: SearchItemType.Shortcut,
  },
  sendToken: {
    actionLabel: actionLabels.open,
    hideForWatchedWallets: true,
    hideFromMainSearch: true,
    name: getCommandName('send_token'),
    page: PAGES.TOKEN_DETAIL,
    shortcut: shortcuts.home.GO_TO_SEND,
    symbol: 'paperplane.fill',
    symbolSize: 14.5,
    type: SearchItemType.Shortcut,
  },
  swapToken: {
    actionLabel: actionLabels.open,
    hideForWatchedWallets: true,
    hideFromMainSearch: true,
    name: getCommandName('swap_token'),
    page: PAGES.TOKEN_DETAIL,
    searchTags: getSearchTags('swap'),
    shortcut: shortcuts.home.GO_TO_SWAP,
    symbol: 'arrow.triangle.swap',
    symbolSize: 15.5,
    type: SearchItemType.Shortcut,
  },
  copyTokenAddress: {
    hideFromMainSearch: true,
    name: getCommandName('copy_token_address'),
    page: PAGES.TOKEN_DETAIL,
    shouldRemainOnActiveRoute: true,
    symbol: 'square.on.square',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  viewTokenOnExplorer: {
    actionLabel: actionLabels.openInNewTab,
    hideFromMainSearch: true,
    name: getCommandName('view_token_on_explorer'),
    page: PAGES.TOKEN_DETAIL,
    symbol: 'magnifyingglass',
    symbolSize: 14.5,
    type: SearchItemType.Shortcut,
  },

  // PAGE: UNOWNED_WALLET_DETAIL
  addAsWatchedWallet: {
    hideFromMainSearch: true,
    name: getCommandName('add_as_watched_wallet'),
    page: PAGES.UNOWNED_WALLET_DETAIL,
    symbol: 'eyes.inverse',
    symbolSize: 16,
    type: SearchItemType.Shortcut,
  },
  copyUnownedWalletAddress: {
    hideFromMainSearch: true,
    name: getCommandName('copy_wallet_address'),
    page: PAGES.UNOWNED_WALLET_DETAIL,
    symbol: 'square.on.square',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  viewUnownedWalletNFTs: {
    actionLabel: actionLabels.openInNewTab,
    hideFromMainSearch: true,
    name: getCommandName('view_nfts'),
    page: PAGES.UNOWNED_WALLET_DETAIL,
    searchTags: getSearchTags('view_nfts'),
    shouldRemainOnActiveRoute: true,
    symbol: 'sparkle',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  viewUnownedWalletOnEtherscan: {
    actionLabel: actionLabels.openInNewTab,
    hideFromMainSearch: true,
    name: getCommandName('view_wallet_on_etherscan'),
    page: PAGES.UNOWNED_WALLET_DETAIL,
    symbol: 'magnifyingglass',
    symbolSize: 14.5,
    type: SearchItemType.Shortcut,
  },
  viewUnownedWalletOnENS: {
    actionLabel: actionLabels.openInNewTab,
    hideFromMainSearch: true,
    name: getCommandName('view_on_ens'),
    page: PAGES.UNOWNED_WALLET_DETAIL,
    symbol: 'globe',
    symbolSize: 15.5,
    type: SearchItemType.Shortcut,
  },

  // PAGE: WALLET_DETAIL
  switchToWallet: {
    actionLabel: actionLabels.switchToWallet,
    hideFromMainSearch: true,
    name: getCommandName('switch_to_wallet'),
    page: PAGES.WALLET_DETAIL,
    symbol: 'person.crop.rectangle.stack.fill',
    symbolSize: 16,
    type: SearchItemType.Shortcut,
  },
  copyWalletAddress: {
    hideFromMainSearch: true,
    name: getCommandName('copy_wallet_address'),
    page: PAGES.WALLET_DETAIL,
    symbol: 'square.on.square',
    symbolSize: 15,
    type: SearchItemType.Shortcut,
  },
  viewWalletOnEtherscan: {
    actionLabel: actionLabels.openInNewTab,
    hideFromMainSearch: true,
    name: getCommandName('view_wallet_on_etherscan'),
    page: PAGES.WALLET_DETAIL,
    symbol: 'magnifyingglass',
    symbolSize: 14.5,
    type: SearchItemType.Shortcut,
  },
  viewOnENS: {
    actionLabel: actionLabels.openInNewTab,
    hideFromMainSearch: true,
    name: getCommandName('view_on_ens'),
    page: PAGES.WALLET_DETAIL,
    symbol: 'globe',
    symbolSize: 15.5,
    type: SearchItemType.Shortcut,
  },
};

const compileCommandList = (
  isFullScreen: boolean,
  isWatchedWallet: boolean,
  overrides: CommandOverride,
  staticInfo: CommandInfo,
  tokens: TokenSearchItem[],
  walletSearchResult: ENSOrAddressSearchItem[],
  wallets: WalletSearchItem[],
): SearchItem[] => {
  const shortcuts = Object.keys(staticInfo)
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

  return [...shortcuts, ...tokens, ...walletSearchResult, ...wallets];
};

const isENSOrAddressCommand = (
  command: SearchItem | null,
): command is ENSOrAddressSearchItem =>
  command?.type === SearchItemType.ENSOrAddressResult;
const isTokenCommand = (
  command: SearchItem | null,
): command is TokenSearchItem => command?.type === SearchItemType.Token;
const isWalletCommand = (
  command: SearchItem | null,
): command is WalletSearchItem => command?.type === SearchItemType.Wallet;

const isETHAddress = (address: Address | 'eth') =>
  address === 'eth' || address === '0x0000000000000000000000000000000000000000';

export const useCommands = (
  currentPage: CommandKPage,
  previousPageState: CommandKPageState,
  searchQuery: string,
  setSelectedCommandNeedsUpdate: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { isFirefox } = useBrowser();
  const { currentAddress: address, setCurrentAddress } =
    useCurrentAddressStore();
  const { currentTheme } = useCurrentThemeStore();
  const { data: ensName } = useEnsName({ address });
  const { featureFlags } = useFeatureFlagsStore();
  const isFullScreen = useIsFullScreen();
  const navigate = useRainbowNavigate();
  const navigateToSwaps = useNavigateToSwaps();
  const { isWatchingWallet } = useWallets();
  const { save } = useSavedEnsNames();
  const { searchableENSOrAddress } = useSearchableENSorAddress(
    currentPage,
    searchQuery,
    setSelectedCommandNeedsUpdate,
  );
  const { searchableTokens } = useSearchableTokens();
  const { searchableWallets } = useSearchableWallets(currentPage);
  const { setSelectedToken } = useSelectedTokenStore();

  const { hideAssetBalances, setHideAssetBalances } =
    useHideAssetBalancesStore();
  const { hideSmallBalances, setHideSmallBalances } =
    useHideSmallBalancesStore();

  const handleCopy = React.useCallback((address: Address) => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, []);

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

  const handleToggleHiddenSmallBalances = React.useCallback(() => {
    const status = hideSmallBalances ? 'revealed' : 'hidden';
    triggerToast({
      title: i18n.t(`command_k.hide_small_balances_toast.title_${status}`),
      description: i18n.t(
        `command_k.hide_small_balances_toast.description_${status}`,
      ),
    });
    setHideSmallBalances(!hideSmallBalances);
  }, [hideSmallBalances, setHideSmallBalances]);

  const openProfile = React.useCallback(
    (command?: ENSOrAddressSearchItem) =>
      goToNewTab({
        url: getProfileUrl(
          (command?.ensName ?? command?.address) || (ensName ?? address),
        ),
      }),
    [address, ensName],
  );

  const handleSelectAddress = React.useCallback(
    (selectedWallet: SearchItem | null) => {
      if (selectedWallet && isWalletCommand(selectedWallet)) {
        setCurrentAddress(selectedWallet.address);
      }
    },
    [setCurrentAddress],
  );

  const selectTokenAndNavigate = React.useCallback(
    (asset: ParsedUserAsset, to: To) => {
      setSelectedToken(asset);
      navigate(to);
    },
    [navigate, setSelectedToken],
  );

  const viewTokenOnExplorer = React.useCallback((asset: ParsedUserAsset) => {
    if (isETHAddress(asset.address)) {
      return;
    }
    const explorer = getBlockExplorerHostForChain(asset.chainId);
    goToNewTab({ url: getExplorerUrl(explorer, asset.address) });
  }, []);

  const handleWatchWallet = React.useCallback(
    async (command: ENSOrAddressSearchItem) => {
      if (!command.address) return;

      const importedAddress = await wallet.importWithSecret(command.address);
      if (!importedAddress) return;

      if (command.ensName) save(command.ensName, command.address);
      setCurrentAddress(importedAddress);
    },
    [save, setCurrentAddress],
  );

  const openENSApp = React.useCallback((ensName: string) => {
    goToNewTab({ url: `https://app.ens.domains/${ensName}` });
  }, []);

  const viewWalletOnEtherscan = React.useCallback((address: Address) => {
    const explorer = getBlockExplorerHostForChain(ChainId.mainnet);
    goToNewTab({ url: getExplorerUrl(explorer, address) });
  }, []);

  const commandOverrides: CommandOverride = React.useMemo(
    () => ({
      // PAGE: HOME
      swap: {
        action: navigateToSwaps,
      },
      myTokens: {
        name: isWatchingWallet
          ? getCommandName('my_tokens_watched')
          : getCommandName('my_tokens'),
        searchTags: isWatchingWallet ? getSearchTags('my_tokens_watched') : [],
        selectedWallet: ensName || truncateAddress(address),
      },
      copyAddress: {
        action: () => handleCopy(address),
      },
      viewNFTs: {
        action: openProfile,
      },
      lock: {
        action: () => wallet.lock(),
      },
      myQRCode: {
        name: isWatchingWallet
          ? getCommandName('my_qr_code_watched')
          : getCommandName('my_qr_code'),
        searchTags: isWatchingWallet ? getSearchTags('my_qr_code_watched') : [],
        selectedWallet: ensName || truncateAddress(address),
      },
      hideBalances: {
        action: handleToggleHiddenBalances,
        name: hideAssetBalances
          ? getCommandName('hide_balances_hidden')
          : getCommandName('hide_balances_revealed'),
      },
      hideSmallBalances: {
        action: handleToggleHiddenSmallBalances,
        name: hideSmallBalances
          ? getCommandName('hide_small_balances_hidden')
          : getCommandName('hide_small_balances_revealed'),
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

      // PAGE: ADD_WALLET
      createWallet: {
        action: () =>
          navigate(ROUTES.CHOOSE_WALLET_GROUP, {
            state: { direction: 'upRight', navbarIcon: 'ex' },
          }),
      },
      importWallet: {
        action: () =>
          navigate(ROUTES.NEW_IMPORT_WALLET, {
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
      addHardwareWallet: {
        action: () => {
          isFirefox
            ? triggerAlert({ text: i18n.t('alert.no_hw_ff') })
            : navigate(ROUTES.HW_CHOOSE, {
                state: { direction: 'upRight', navbarIcon: 'ex' },
              });
        },
      },

      // PAGE: TOKEN_DETAIL
      viewToken: {
        action: () =>
          isTokenCommand(previousPageState.selectedCommand) &&
          navigate(
            ROUTES.TOKEN_DETAILS(
              previousPageState.selectedCommand?.asset.uniqueId,
            ),
          ),
        asset: isTokenCommand(previousPageState.selectedCommand)
          ? previousPageState.selectedCommand?.asset
          : undefined,
      },
      sendToken: {
        action: () =>
          isTokenCommand(previousPageState.selectedCommand) &&
          selectTokenAndNavigate(
            previousPageState.selectedCommand?.asset,
            ROUTES.SEND,
          ),
        name: `${getCommandName('send')} ${previousPageState.selectedCommand
          ?.asset?.symbol}`,
      },
      swapToken: {
        action: () =>
          isTokenCommand(previousPageState.selectedCommand) &&
          selectTokenAndNavigate(
            previousPageState.selectedCommand?.asset,
            ROUTES.SWAP,
          ),
        name: `${getCommandName('swap')} ${previousPageState.selectedCommand
          ?.asset?.symbol}`,
      },
      copyTokenAddress: {
        action: () =>
          previousPageState.selectedCommand?.asset?.address &&
          previousPageState.selectedCommand?.asset?.address !== 'eth' &&
          handleCopy(previousPageState.selectedCommand?.asset?.address),
        hidden:
          !previousPageState.selectedCommand?.asset?.address ||
          isETHAddress(previousPageState.selectedCommand?.asset?.address),
      },
      viewTokenOnExplorer: {
        action: () =>
          previousPageState.selectedCommand?.asset?.address &&
          viewTokenOnExplorer(previousPageState.selectedCommand?.asset),
        hidden:
          !previousPageState.selectedCommand?.asset?.address ||
          isETHAddress(previousPageState.selectedCommand?.asset?.address),
      },

      // PAGE: UNOWNED_WALLET_DETAIL
      addAsWatchedWallet: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          handleWatchWallet(previousPageState.selectedCommand),
        address: isENSOrAddressCommand(previousPageState.selectedCommand)
          ? previousPageState.selectedCommand?.address
          : undefined,
        symbol: currentTheme === 'dark' ? 'eyes.inverse' : 'eyes',
      },
      copyUnownedWalletAddress: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          handleCopy(previousPageState.selectedCommand.address),
        hidden:
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          !previousPageState.selectedCommand?.ensName,
      },
      viewUnownedWalletNFTs: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          openProfile(previousPageState.selectedCommand),
      },
      viewUnownedWalletOnEtherscan: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          viewWalletOnEtherscan(previousPageState.selectedCommand.address),
      },
      viewUnownedWalletOnENS: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          previousPageState.selectedCommand?.ensName &&
          openENSApp(previousPageState.selectedCommand.ensName),
        hidden:
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          !previousPageState.selectedCommand?.ensName,
      },

      // PAGE: WALLET_DETAIL
      switchToWallet: {
        action: () => handleSelectAddress(previousPageState.selectedCommand),
        address: isWalletCommand(previousPageState.selectedCommand)
          ? previousPageState.selectedCommand?.address
          : undefined,
      },
      copyWalletAddress: {
        action: () =>
          isWalletCommand(previousPageState.selectedCommand) &&
          handleCopy(previousPageState.selectedCommand.address),
      },
      viewWalletOnEtherscan: {
        action: () =>
          isWalletCommand(previousPageState.selectedCommand) &&
          viewWalletOnEtherscan(previousPageState.selectedCommand.address),
      },
      viewOnENS: {
        action: () =>
          isWalletCommand(previousPageState.selectedCommand) &&
          previousPageState.selectedCommand?.ensName &&
          openENSApp(previousPageState.selectedCommand.ensName),
        hidden:
          isWalletCommand(previousPageState.selectedCommand) &&
          !previousPageState.selectedCommand?.ensName,
      },
    }),
    [
      address,
      currentTheme,
      ensName,
      handleCopy,
      handleSelectAddress,
      handleToggleHiddenBalances,
      handleToggleHiddenSmallBalances,
      handleWatchWallet,
      hideAssetBalances,
      hideSmallBalances,
      isWatchingWallet,
      navigate,
      navigateToSwaps,
      openENSApp,
      openProfile,
      previousPageState.selectedCommand,
      selectTokenAndNavigate,
      viewWalletOnEtherscan,
      viewTokenOnExplorer,
      isFirefox,
    ],
  );

  const commandList = React.useMemo(
    () =>
      compileCommandList(
        isFullScreen,
        (isWatchingWallet ?? false) && !featureFlags.full_watching_wallets,
        commandOverrides,
        staticCommandInfo,
        searchableTokens,
        searchableENSOrAddress,
        searchableWallets,
      ),
    [
      isFullScreen,
      isWatchingWallet,
      featureFlags.full_watching_wallets,
      commandOverrides,
      searchableTokens,
      searchableENSOrAddress,
      searchableWallets,
    ],
  );

  return { commandList };
};
