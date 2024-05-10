import React from 'react';
import { To } from 'react-router-dom';
import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore, useFlashbotsEnabledStore } from '~/core/state';
import { useContactsStore } from '~/core/state/contacts';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useDeveloperToolsEnabledStore } from '~/core/state/currentSettings/developerToolsEnabled';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useHideAssetBalancesStore } from '~/core/state/currentSettings/hideAssetBalances';
import { useHideSmallBalancesStore } from '~/core/state/currentSettings/hideSmallBalances';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useSavedEnsNames } from '~/core/state/savedEnsNames';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { KeychainType } from '~/core/types/keychainTypes';
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
import { useAccounts } from '~/entries/popup/hooks/useAccounts';
import { useNavigateToSwaps } from '~/entries/popup/hooks/useNavigateToSwaps';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useWallets } from '~/entries/popup/hooks/useWallets';
import { ROUTES } from '~/entries/popup/urls';

import { useBrowser } from '../../hooks/useBrowser';
import { useCurrentWalletTypeAndVendor } from '../../hooks/useCurrentWalletType';
import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { triggerToast } from '../Toast/Toast';

import {
  ContactSearchItem,
  ENSOrAddressSearchItem,
  NFTSearchItem,
  SearchItem,
  SearchItemType,
  ShortcutSearchItem,
  TokenSearchItem,
  WalletSearchItem,
} from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { actionLabels } from './references';
import { CommandKPageState } from './useCommandKNavigation';
import { useSearchableContacts } from './useSearchableContacts';
import { useSearchableENSorAddress } from './useSearchableENSOrAddress';
import { useSearchableNFTs } from './useSearchableNFTs';
import { useSearchableTokens } from './useSearchableTokens';
import { useSearchableWallets } from './useSearchableWallets';
import { handleExportAddresses } from './utils';

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

export const getStaticCommandInfo = (): CommandInfo => {
  return {
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
    myContacts: {
      actionLabel: actionLabels.view,
      name: getCommandName('my_contacts'),
      page: PAGES.HOME,
      searchTags: getSearchTags('my_contacts'),
      symbol: 'person.crop.circle.fill',
      symbolSize: 16,
      toPage: PAGES.MY_CONTACTS,
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
    myNFTs: {
      actionLabel: actionLabels.view,
      name: getCommandName('my_nfts'),
      page: PAGES.HOME,
      symbol: 'photo',
      symbolSize: 16.25,
      toPage: PAGES.MY_NFTS,
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
    viewProfile: {
      actionLabel: actionLabels.openInNewTab,
      name: getCommandName('view_profile'),
      page: PAGES.HOME,
      searchTags: getSearchTags('view_profile'),
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
    developerTools: {
      name: getCommandName('developer_tools'),
      page: PAGES.HOME,
      searchTags: getSearchTags('developer_tools'),
      symbol: 'hammer.fill',
      symbolSize: 15.75,
      type: SearchItemType.Shortcut,
    },
    testnetMode: {
      name: getCommandName('testnet_mode'),
      page: PAGES.HOME,
      searchTags: getSearchTags('testnet_mode'),
      shortcut: shortcuts.home.TESTNET_MODE,
      shouldRemainOnActiveRoute: true,
      symbol: 'arcade.stick',
      symbolSize: 15.75,
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
    networkSettings: {
      actionLabel: actionLabels.open,
      name: getCommandName('network_settings'),
      page: PAGES.HOME,
      searchTags: getSearchTags('network_settings'),
      symbol: 'network',
      symbolSize: 14.75,
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
    flashbots: {
      actionLabel: actionLabels.activateCommand,
      shouldRemainOnActiveRoute: true,
      name: getCommandName('enable_flashbots'),
      symbol: 'bolt.shield.fill',
      symbolSize: 15,
      type: SearchItemType.Shortcut,
    },
    exportAddresses: {
      name: i18n.t(`command_k.commands.names.export_addresses_as_csv`),
      page: PAGES.HOME,
      shouldRemainOnActiveRoute: true,
      searchTags: getSearchTags('export_addresses'),
      symbol: 'doc.on.doc',
      symbolSize: 15,
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
    watchUnownedWallet: {
      hideFromMainSearch: true,
      name: getCommandName('add_as_watched_wallet'),
      page: PAGES.UNOWNED_WALLET_DETAIL,
      symbol: 'eyes.inverse',
      symbolSize: 16,
      type: SearchItemType.Shortcut,
    },
    addUnownedWalletContact: {
      actionLabel: actionLabels.activateCommand,
      hideFromMainSearch: true,
      name: getCommandName('add_contact'),
      page: PAGES.UNOWNED_WALLET_DETAIL,
      symbol: 'plus.app.fill',
      symbolSize: 14.5,
      type: SearchItemType.Shortcut,
    },
    removeUnownedWalletContact: {
      actionLabel: actionLabels.activateCommand,
      hideFromMainSearch: true,
      name: getCommandName('remove_contact'),
      page: PAGES.UNOWNED_WALLET_DETAIL,
      symbol: 'trash.fill',
      symbolSize: 14.5,
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
    viewUnownedWalletOnEtherscan: {
      actionLabel: actionLabels.openInNewTab,
      hideFromMainSearch: true,
      name: getCommandName('view_wallet_on_etherscan'),
      page: PAGES.UNOWNED_WALLET_DETAIL,
      symbol: 'magnifyingglass',
      symbolSize: 14.5,
      type: SearchItemType.Shortcut,
    },
    viewUnownedWalletProfile: {
      actionLabel: actionLabels.openInNewTab,
      hideFromMainSearch: true,
      name: getCommandName('view_profile'),
      page: PAGES.UNOWNED_WALLET_DETAIL,
      searchTags: getSearchTags('view_profile'),
      shouldRemainOnActiveRoute: true,
      symbol: 'sparkle',
      symbolSize: 15,
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
    sendToWallet: {
      actionLabel: actionLabels.activateCommand,
      hideFromMainSearch: true,
      hideForWatchedWallets: true,
      name: getCommandName('send_to_wallet'),
      page: PAGES.WALLET_DETAIL,
      symbol: 'paperplane.fill',
      symbolSize: 14.5,
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

    // PAGE: CONTACT_DETAIL
    sendToContact: {
      actionLabel: actionLabels.activateCommand,
      hideFromMainSearch: true,
      hideForWatchedWallets: true,
      name: getCommandName('send_contact'),
      page: PAGES.CONTACT_DETAIL,
      symbol: 'paperplane.fill',
      symbolSize: 14.5,
      type: SearchItemType.Shortcut,
    },
    removeContact: {
      actionLabel: actionLabels.activateCommand,
      hideFromMainSearch: true,
      name: getCommandName('remove_contact'),
      page: PAGES.CONTACT_DETAIL,
      symbol: 'trash.fill',
      symbolSize: 14.5,
      type: SearchItemType.Shortcut,
    },
    copyContactAddress: {
      hideFromMainSearch: true,
      name: getCommandName('copy_address'),
      page: PAGES.CONTACT_DETAIL,
      shortcut: shortcuts.home.COPY_ADDRESS,
      shouldRemainOnActiveRoute: true,
      symbol: 'square.on.square',
      symbolSize: 15,
      type: SearchItemType.Shortcut,
    },
    viewContactOnEtherscan: {
      actionLabel: actionLabels.openInNewTab,
      hideFromMainSearch: true,
      name: getCommandName('view_wallet_on_etherscan'),
      page: PAGES.CONTACT_DETAIL,
      symbol: 'magnifyingglass',
      symbolSize: 14.5,
      type: SearchItemType.Shortcut,
    },
    viewContactProfile: {
      actionLabel: actionLabels.openInNewTab,
      hideFromMainSearch: true,
      name: getCommandName('view_profile'),
      page: PAGES.CONTACT_DETAIL,
      symbol: 'sparkle',
      symbolSize: 15,
      type: SearchItemType.Shortcut,
    },
  };
};

const compileCommandList = (
  isFullScreen: boolean,
  isWatchedWallet: boolean,
  overrides: CommandOverride,
  staticInfo: CommandInfo,
  wallets: WalletSearchItem[],
  contacts: ContactSearchItem[],
  walletSearchResult: ENSOrAddressSearchItem[],
  tokens: TokenSearchItem[],
  nfts: NFTSearchItem[],
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
    .map((key) => {
      return {
        id: key,
        ...staticInfo[key],
        ...overrides[key],
        onClick: overrides[key]?.action,
      };
    });

  return [
    ...shortcuts,
    ...wallets,
    ...contacts,
    ...walletSearchResult,
    ...tokens,
    ...nfts,
  ];
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
const isContactCommand = (
  command: SearchItem | null,
): command is ContactSearchItem => command?.type === SearchItemType.Contact;

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
  const save = useSavedEnsNames.use.save();
  const { searchableENSOrAddress } = useSearchableENSorAddress(
    currentPage,
    searchQuery,
    setSelectedCommandNeedsUpdate,
  );
  const { searchableTokens } = useSearchableTokens();
  const { searchableNFTs } = useSearchableNFTs();
  const { searchableWallets } = useSearchableWallets(currentPage);
  const setSelectedToken = useSelectedTokenStore.use.setSelectedToken();
  const { searchableContacts } = useSearchableContacts({
    showLabel: !!searchQuery && currentPage === PAGES.HOME,
  });
  const { sortedAccounts } = useAccounts();

  const { setTestnetMode, testnetMode } = useTestnetModeStore();
  const { developerToolsEnabled, setDeveloperToolsEnabled } =
    useDeveloperToolsEnabledStore();
  const { hideAssetBalances, setHideAssetBalances } =
    useHideAssetBalancesStore();
  const { hideSmallBalances, setHideSmallBalances } =
    useHideSmallBalancesStore();

  const { currentAddress } = useCurrentAddressStore();

  const { flashbotsEnabled, setFlashbotsEnabled } = useFlashbotsEnabledStore();

  const { contacts, deleteContact, saveContact } = useContactsStore();

  const { type, vendor } = useCurrentWalletTypeAndVendor();

  const isTrezor =
    type === KeychainType.HardwareWalletKeychain && vendor === 'Trezor';

  const shouldNavigateToSend = !(isTrezor && !isFullScreen);

  const handleCopy = React.useCallback((address: Address) => {
    navigator.clipboard.writeText(address as string);
    triggerToast({
      title: i18n.t('wallet_header.copy_toast'),
      description: truncateAddress(address),
    });
  }, []);

  const isContactAdded = React.useCallback(
    (address: Address) => !!contacts[address || ''],
    [contacts],
  );

  const handleToggleDeveloperTools = React.useCallback(() => {
    const status = developerToolsEnabled ? 'disabled' : 'enabled';
    triggerToast({
      title: i18n.t(`command_k.developer_tools_toast.title_${status}`),
      description: developerToolsEnabled
        ? undefined
        : i18n.t('command_k.developer_tools_toast.description_enabled'),
    });
    setDeveloperToolsEnabled(!developerToolsEnabled);
  }, [developerToolsEnabled, setDeveloperToolsEnabled]);

  const handleToggleTestnetMode = React.useCallback(() => {
    const current = testnetMode;
    setTestnetMode(!current);
  }, [setTestnetMode, testnetMode]);

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
    (command?: ENSOrAddressSearchItem | WalletSearchItem | ContactSearchItem) =>
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
    explorer && goToNewTab({ url: getExplorerUrl(explorer, asset.address) });
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
    explorer && goToNewTab({ url: getExplorerUrl(explorer, address) });
  }, []);

  const handleSendFallback = React.useCallback(
    (address: Address) => {
      // Trezor needs to be opened in a new tab because of their own popup
      if (isTrezor && !isFullScreen) {
        goToNewTab({
          url: POPUP_URL + `#${ROUTES.SEND}?hideBack=true&to=${address}`,
        });
      }
    },
    [isTrezor, isFullScreen],
  );

  const handleSendToWallet = React.useCallback(
    (address: Address) => {
      if (shouldNavigateToSend) {
        navigate(`${ROUTES.SEND}?to=${address}`);
      } else {
        handleSendFallback(address);
      }
    },
    [shouldNavigateToSend, handleSendFallback, navigate],
  );

  const handleAddContact = React.useCallback(
    (address: Address, ensName?: string | null) => {
      saveContact({ contact: { address, name: ensName || '' } });
      triggerToast({
        title: i18n.t(`command_k.contact_toast.title_added`),
        description: ensName || truncateAddress(address),
      });
    },
    [saveContact],
  );

  const handleRemoveContact = React.useCallback(
    (address: Address, ensName?: string | null) => {
      deleteContact({ address });
      triggerToast({
        title: i18n.t(`command_k.contact_toast.title_removed`),
        description: ensName || truncateAddress(address),
      });
    },
    [deleteContact],
  );

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
      myContacts: {
        hidden: contacts && Object.keys(contacts).length === 0,
      },
      myNFTs: {
        name: isWatchingWallet
          ? getCommandName('my_nfts_watched')
          : getCommandName('my_nfts'),
        searchTags: isWatchingWallet ? getSearchTags('my_nfts_watched') : [],
        selectedWallet: ensName || truncateAddress(address),
      },
      copyAddress: {
        action: () => handleCopy(address),
      },
      exportAddresses: {
        action: () => handleExportAddresses(sortedAccounts),
      },
      viewProfile: {
        action: openProfile,
      },
      lock: {
        action: () => wallet.lock(),
      },
      developerTools: {
        action: handleToggleDeveloperTools,
        name: developerToolsEnabled
          ? getCommandName('developer_tools_enabled')
          : getCommandName('developer_tools_disabled'),
        shouldRemainOnActiveRoute: developerToolsEnabled,
      },
      testnetMode: {
        action: handleToggleTestnetMode,
        name: testnetMode
          ? getCommandName('testnet_mode_enabled')
          : getCommandName('testnet_mode_disabled'),
        hidden: testnetMode ? false : !developerToolsEnabled,
      },
      networkSettings: {
        action: () =>
          navigate(ROUTES.SETTINGS__NETWORKS, {
            state: { direction: 'upRight', navbarIcon: 'ex' },
          }),
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
      flashbots: {
        action: () => setFlashbotsEnabled(!flashbotsEnabled),
        name: flashbotsEnabled
          ? getCommandName('disable_flashbots')
          : getCommandName('enable_flashbots'),
        symbol: flashbotsEnabled ? 'bolt.shield' : 'bolt.shield.fill',
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
      watchUnownedWallet: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          handleWatchWallet(previousPageState.selectedCommand),
        address: isENSOrAddressCommand(previousPageState.selectedCommand)
          ? previousPageState.selectedCommand?.address
          : undefined,
        symbol: currentTheme === 'dark' ? 'eyes.inverse' : 'eyes',
      },
      addUnownedWalletContact: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          handleAddContact(
            previousPageState.selectedCommand.address,
            previousPageState.selectedCommand.ensName,
          ),
        hidden:
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          isContactAdded(previousPageState.selectedCommand.address),
      },
      removeUnownedWalletContact: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          handleRemoveContact(
            previousPageState.selectedCommand.address,
            previousPageState.selectedCommand.ensName,
          ),
        hidden:
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          !isContactAdded(previousPageState.selectedCommand.address),
      },
      copyUnownedWalletAddress: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          handleCopy(previousPageState.selectedCommand.address),
        hidden:
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          !previousPageState.selectedCommand?.ensName,
      },
      viewUnownedWalletOnEtherscan: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          viewWalletOnEtherscan(previousPageState.selectedCommand.address),
      },
      viewUnownedWalletProfile: {
        action: () =>
          isENSOrAddressCommand(previousPageState.selectedCommand) &&
          openProfile(previousPageState.selectedCommand),
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
        hidden:
          isWalletCommand(previousPageState.selectedCommand) &&
          currentAddress === previousPageState.selectedCommand?.address,
      },
      sendToWallet: {
        action: () =>
          isWalletCommand(previousPageState.selectedCommand) &&
          handleSendToWallet(previousPageState.selectedCommand?.address),
        hidden: isWatchingWallet,
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

      // PAGE: CONTACT_DETAIL
      sendToContact: {
        action: () =>
          isContactCommand(previousPageState.selectedCommand) &&
          handleSendToWallet(previousPageState.selectedCommand.address),
        hidden:
          isWatchingWallet ||
          (isContactCommand(previousPageState.selectedCommand) &&
            currentAddress === previousPageState.selectedCommand.address),
      },
      removeContact: {
        action: () =>
          isContactCommand(previousPageState.selectedCommand) &&
          handleRemoveContact(
            previousPageState.selectedCommand.address,
            previousPageState.selectedCommand.ensName,
          ),
        hidden:
          isContactCommand(previousPageState.selectedCommand) &&
          currentAddress === previousPageState.selectedCommand.address,
      },
      copyContactAddress: {
        action: () =>
          isContactCommand(previousPageState.selectedCommand) &&
          handleCopy(previousPageState.selectedCommand.address),
      },
      viewContactOnEtherscan: {
        action: () =>
          isContactCommand(previousPageState.selectedCommand) &&
          viewWalletOnEtherscan(previousPageState.selectedCommand.address),
      },
      viewContactProfile: {
        action: () =>
          isContactCommand(previousPageState.selectedCommand) &&
          openProfile(previousPageState.selectedCommand),
      },
    }),
    [
      navigateToSwaps,
      isWatchingWallet,
      ensName,
      address,
      openProfile,
      handleToggleDeveloperTools,
      developerToolsEnabled,
      handleToggleTestnetMode,
      testnetMode,
      handleToggleHiddenBalances,
      hideAssetBalances,
      handleToggleHiddenSmallBalances,
      hideSmallBalances,
      flashbotsEnabled,
      currentTheme,
      previousPageState.selectedCommand,
      isContactAdded,
      handleCopy,
      sortedAccounts,
      contacts,
      navigate,
      setFlashbotsEnabled,
      isFirefox,
      selectTokenAndNavigate,
      viewTokenOnExplorer,
      handleWatchWallet,
      viewWalletOnEtherscan,
      openENSApp,
      handleSelectAddress,
      handleAddContact,
      handleRemoveContact,
      handleSendToWallet,
      currentAddress,
    ],
  );

  const commandList = React.useMemo(
    () =>
      compileCommandList(
        isFullScreen,
        (isWatchingWallet ?? false) && !featureFlags.full_watching_wallets,
        commandOverrides,
        getStaticCommandInfo(),
        searchableWallets,
        searchableContacts,
        searchableENSOrAddress,
        searchableTokens,
        searchableNFTs,
      ),
    [
      isFullScreen,
      isWatchingWallet,
      featureFlags.full_watching_wallets,
      commandOverrides,
      searchableTokens,
      searchableNFTs,
      searchableENSOrAddress,
      searchableWallets,
      searchableContacts,
    ],
  );

  return { commandList };
};
