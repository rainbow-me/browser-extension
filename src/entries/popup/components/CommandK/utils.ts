import * as React from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { KeychainType, KeychainWallet } from '~/core/types/keychainTypes';
import { Account } from '~/entries/popup/hooks/useAccounts';

import { getWallets } from '../../handlers/wallet';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { triggerToast } from '../Toast/Toast';

import { SearchItem, SearchItemType } from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { useCommandKStatus } from './useCommandKStatus';

export const SCROLL_TO_BEHAVIOR = 'auto';

export type SearchItemWithRelevance = SearchItem & {
  relevance: number;
};

interface CacheItem {
  [name: string]: number;
}

const shouldHideCommand = (
  command: SearchItem,
  currentPage: CommandKPage,
  query: string,
) =>
  command.hidden ||
  (currentPage === PAGES.HOME &&
    query === '' &&
    command.type === SearchItemType.Wallet) ||
  (currentPage === PAGES.HOME && command.hideFromMainSearch) ||
  (currentPage !== PAGES.HOME && currentPage !== command.page);

const calculateCommandRelevance = (
  command: SearchItem,
  query: string,
): number => {
  if (query === '') {
    return 0;
  } else {
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(' ').filter(Boolean);

    const normalizedCommandName = command.name.toLowerCase();
    const commandNameWords = normalizedCommandName.split(' ');

    const normalizedShortcutKey = command.shortcut?.key.toLowerCase();

    if (command.type === SearchItemType.Wallet) {
      const normalizedAddress = command.address
        ? command.address.toLowerCase()
        : '';
      const normalizedWalletName = command.walletName
        ? command.walletName.toLowerCase()
        : '';
      const normalizedEnsName = command.ensName
        ? command.ensName.toLowerCase()
        : '';

      if (command.id?.startsWith('contact')) {
        return 0;
      }

      // High relevance: Wallet name or ENS name or address starts with the query
      if (
        (normalizedQuery.length > 2 &&
          normalizedAddress.startsWith(normalizedQuery)) ||
        normalizedWalletName.startsWith(normalizedQuery) ||
        normalizedEnsName.startsWith(normalizedQuery) ||
        (normalizedShortcutKey && normalizedShortcutKey === normalizedQuery)
      ) {
        return 4;
      }

      // Low-medium relevance: Wallet name, ENS name, or address contains the query
      if (
        normalizedWalletName.includes(normalizedQuery) ||
        normalizedEnsName.includes(normalizedQuery)
      ) {
        return 2;
      }
    } else if (command.type === SearchItemType.ENSOrAddressResult) {
      // Only a single exact match is possible
      return 4;
    } else {
      // High relevance: Command name starts with query
      if (
        (!command.downrank &&
          normalizedCommandName.startsWith(normalizedQuery)) ||
        (normalizedShortcutKey && normalizedShortcutKey === normalizedQuery)
      ) {
        return 4;
      }

      // Medium relevance: Non-leading word in command name starts with query
      if (
        commandNameWords.some(
          (word, index) => index !== 0 && word.startsWith(normalizedQuery),
        )
      ) {
        return 3;
      }

      // Low-medium relevance: A search tag begins with the query
      const normalizedTags = command.searchTags
        ? command.searchTags.map((tag) => tag.toLowerCase())
        : [];
      if (normalizedTags.some((tag) => tag.startsWith(normalizedQuery))) {
        return 2;
      }

      // Low relevance: Command name or search tags contain the query
      const checkSet = new Set([...commandNameWords, ...normalizedTags]);
      if (
        queryWords.every((word) => {
          for (const item of checkSet) {
            if (item.includes(word)) {
              checkSet.delete(item);
              return true;
            }
          }
          return false;
        })
      ) {
        return 1;
      }
    }
    return 0;
  }
};

const memoize = (
  search: (
    commandList: SearchItem[],
    currentPage: CommandKPage,
    query: string,
  ) => SearchItemWithRelevance[],
) => {
  const pageCache = new Map<CommandKPage, Map<string, CacheItem>>();
  let commandListVersion = 0;

  return (
    commandList: SearchItem[],
    currentPage: CommandKPage,
    query: string,
  ): SearchItemWithRelevance[] => {
    let resultsCache = pageCache.get(currentPage);
    if (!resultsCache) {
      resultsCache = new Map<string, CacheItem>();
      pageCache.set(currentPage, resultsCache);
    }

    if (query === '') {
      return commandList
        .filter(
          (cmd) =>
            cmd.page === currentPage &&
            !shouldHideCommand(cmd, currentPage, query),
        )
        .map((cmd) => ({ ...cmd, relevance: 0 }));
    }

    const currentVersion = commandList.length;

    if (commandListVersion !== currentVersion) {
      for (const [query, cacheItem] of resultsCache) {
        const newCacheItem: CacheItem = {};
        commandList.forEach((cmd) => {
          const key = cmd.id || cmd.name;
          const relevance =
            key in cacheItem
              ? cacheItem[key]
              : calculateCommandRelevance(cmd, query);
          newCacheItem[key] = relevance;
        });
        resultsCache.set(query, newCacheItem);
      }
      commandListVersion = currentVersion;
    }

    if (!resultsCache.has(query)) {
      const result = search(commandList, currentPage, query);
      const cacheItem: CacheItem = {};
      result.forEach(
        (item) => (cacheItem[item.id || item.name] = item.relevance),
      );
      resultsCache.set(query, cacheItem);
    }

    const cachedItem = resultsCache.get(query) as CacheItem;

    return commandList
      .map((cmd) => ({
        ...cmd,
        relevance: cachedItem[cmd.id || cmd.name] || 0,
      }))
      .filter((cmd) => cmd.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);
  };
};

export const filterAndSortCommands = memoize(
  (
    commandList: SearchItem[],
    currentPage: CommandKPage,
    query: string,
  ): SearchItemWithRelevance[] => {
    const commandWithRelevance: SearchItemWithRelevance[] = [];

    for (const command of commandList) {
      if (shouldHideCommand(command, currentPage, query)) {
        // Do not show command in results
        continue;
      }

      const relevance = calculateCommandRelevance(command, query);

      if (relevance > 0) {
        commandWithRelevance.push({ ...command, relevance });
      }
    }

    return commandWithRelevance.sort((a, b) => b.relevance - a.relevance);
  },
);

export function useCommandExecution(
  clearPageState: () => void,
  clearSearch: () => void,
  filteredCommands: SearchItem[],
  navigateTo: (page: CommandKPage, triggeredCommand: SearchItem) => void,
  selectedCommand: SearchItem | null,
  setDidScrollOrNavigate: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedCommand: React.Dispatch<React.SetStateAction<SearchItem | null>>,
) {
  const { closeCommandK } = useCommandKStatus();
  const navigate = useRainbowNavigate();

  const handleExecuteCommand = React.useCallback(
    (command: SearchItem | null, e?: KeyboardEvent) => {
      const hiddenTypes = [
        SearchItemType.NFT,
        SearchItemType.Token,
        SearchItemType.Wallet,
      ];
      const shouldHideDetails = hiddenTypes.includes(command?.type || 999);
      const id = shouldHideDetails ? undefined : command?.id;
      const name = shouldHideDetails ? undefined : command?.name;
      const getLabel = () => {
        switch (command?.type) {
          case SearchItemType.NFT:
            return 'View NFT';
          case SearchItemType.Token:
            return 'View Token';
          case SearchItemType.Wallet:
            return 'View Wallet';
          default:
            return command?.actionLabel;
        }
      };
      analytics.track(event.commandKActionExecuted, {
        id,
        label: getLabel(),
        name,
      });

      if (e) {
        const { key, metaKey, shiftKey } = e;
        const isCommandEnter = key === shortcuts.global.SELECT.key && metaKey;
        const isShiftEnter = key === shortcuts.global.SELECT.key && shiftKey;

        if (command?.actionPage && (isCommandEnter || isShiftEnter)) {
          navigateTo(command.actionPage, command);
          setDidScrollOrNavigate(true);
          return;
        }
      }

      if (command) {
        if (command.toPage) {
          navigateTo(command.toPage, command);
          setDidScrollOrNavigate(true);
        } else {
          closeCommandK({
            refocus: command.shouldRemainOnActiveRoute ?? false,
          });
          if (command.action) {
            if (!command.shouldRemainOnActiveRoute) {
              navigate(ROUTES.HOME);
            }
            command.action();
          } else if (command.to) {
            navigate(ROUTES.HOME);
            navigate(command.to);
          }
          clearSearch();
          clearPageState();
        }
      }
    },
    [
      clearPageState,
      clearSearch,
      closeCommandK,
      navigate,
      navigateTo,
      setDidScrollOrNavigate,
    ],
  );

  return { selectedCommand, setSelectedCommand, handleExecuteCommand };
}

export function useKeyboardNavigation(
  didScrollOrNavigate: boolean,
  filteredCommands: SearchItem[],
  handleExecuteCommand: (command: SearchItem | null, e?: KeyboardEvent) => void,
  listRef: React.RefObject<HTMLDivElement>,
  selectedCommand: SearchItem | null,
  selectedCommandIndex: number,
  setDidScrollOrNavigate: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedCommand: React.Dispatch<React.SetStateAction<SearchItem | null>>,
) {
  const scrollTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Handle arrow key and tab navigation
  const handleKeyboardNavigation = React.useCallback(
    (e: KeyboardEvent) => {
      const { key, altKey, shiftKey } = e;
      const isArrowUp = key === 'ArrowUp';
      const isArrowDown = key === 'ArrowDown';
      const isTab = key === 'Tab';

      if (isArrowUp || isArrowDown || isTab) {
        e.preventDefault();

        if (filteredCommands.length === 0) {
          setSelectedCommand(null);
          return;
        }

        // Freeze scroll position in case the list is scrolling
        if (listRef.current) {
          if (scrollTimer.current) {
            clearTimeout(scrollTimer.current);
            scrollTimer.current = null;
          }
          listRef.current.style.overflowY = 'hidden';
          scrollTimer.current = setTimeout(() => {
            if (listRef.current) {
              listRef.current.style.overflowY = 'scroll';
            }
          }, 20);
        }

        let newSelectedCommandIndex;
        let listIsScrolledToTop;
        let listIsScrolledToBottom;

        if (listRef.current) {
          listIsScrolledToTop = listRef.current.scrollTop === 0;
          listIsScrolledToBottom =
            listRef.current.scrollTop + listRef.current.clientHeight ===
            listRef.current.scrollHeight;
        }

        if (isArrowUp && altKey) {
          newSelectedCommandIndex = 0;
          requestAnimationFrame(() => {
            listRef.current?.scrollTo({
              top: 0,
              behavior: SCROLL_TO_BEHAVIOR,
            });
          });
        } else if (isArrowDown && altKey) {
          newSelectedCommandIndex = filteredCommands.length - 1;
        } else if (isArrowUp || (isTab && shiftKey)) {
          newSelectedCommandIndex =
            isTab && selectedCommandIndex === 0
              ? filteredCommands.length - 1
              : Math.max(selectedCommandIndex - 1, 0);
          if (isArrowUp && selectedCommandIndex === 0) {
            listRef.current?.scrollTo({
              top: 0,
              behavior: SCROLL_TO_BEHAVIOR,
            });
          }
        } else if (
          isTab &&
          selectedCommandIndex === filteredCommands.length - 1
        ) {
          newSelectedCommandIndex = 0;
          requestAnimationFrame(() => {
            listRef.current?.scrollTo({
              top: 0,
              behavior: SCROLL_TO_BEHAVIOR,
            });
          });
        } else {
          newSelectedCommandIndex = Math.min(
            selectedCommandIndex + 1,
            filteredCommands.length - 1,
          );
        }

        const firstCommandIsSelected = newSelectedCommandIndex === 0;
        const lastCommandIsSelected =
          newSelectedCommandIndex === filteredCommands.length - 1;
        const selectedCommandDidChange =
          newSelectedCommandIndex !== selectedCommandIndex;

        const scrollPositionShouldUpdate =
          (firstCommandIsSelected &&
            !selectedCommandDidChange &&
            !listIsScrolledToTop) ||
          (lastCommandIsSelected &&
            !selectedCommandDidChange &&
            !listIsScrolledToBottom);

        const newSelectedCommand = filteredCommands[newSelectedCommandIndex];

        if (selectedCommandDidChange || scrollPositionShouldUpdate) {
          if (!didScrollOrNavigate) {
            // Disable hover if the selected list item changes via keyboard input
            setDidScrollOrNavigate(true);
          }
          setSelectedCommand(newSelectedCommand);
        }
      } else if (selectedCommand && key === shortcuts.global.SELECT.key) {
        handleExecuteCommand(selectedCommand, e);
      }
    },
    [
      didScrollOrNavigate,
      filteredCommands,
      handleExecuteCommand,
      listRef,
      selectedCommand,
      selectedCommandIndex,
      setDidScrollOrNavigate,
      setSelectedCommand,
    ],
  );

  useKeyboardShortcut({
    handler: handleKeyboardNavigation,
    enableWithinCommandK: true,
  });

  // Clean up scroll timer on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);
}

const typeMapping: { [key: string]: string } = {
  [KeychainType.ReadOnlyKeychain]: i18n.t(
    `command_k.export_public_addresses.keychain_type.watching`,
  ),
  [KeychainType.HdKeychain]: i18n.t(
    `command_k.export_public_addresses.keychain_type.recovery_phrase`,
  ),
  [KeychainType.KeyPairKeychain]: i18n.t(
    `command_k.export_public_addresses.keychain_type.private_key`,
  ),
  [KeychainType.HardwareWalletKeychain]: i18n.t(
    `command_k.export_public_addresses.keychain_type.hardware_wallet`,
  ),
};

const generateCSV = (
  wallets: KeychainWallet[],
  accountsWithNames: Account[],
): string => {
  let csvContent = 'public_address,name,type,wallet_group\n';

  wallets.forEach(({ accounts, type }, i) => {
    accounts.forEach((address) => {
      const { walletName, ensName } =
        accountsWithNames.find((a) => a.address === address) || {};
      const name = walletName || ensName || address;
      const walletType = typeMapping[type];
      const walletGroup =
        type === KeychainType.HdKeychain ? `Wallet Group ${i}` : '-';
      csvContent += `${address},${name},${walletType},${walletGroup}\n`;
    });
  });

  return csvContent;
};

export const handleExportAddresses = async (accounts: Account[]) => {
  const wallets = await getWallets();
  const csvContent = generateCSV(wallets, accounts);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.href = url;
  tempLink.download = i18n.t(
    `command_k.export_public_addresses.toast.description`,
  );
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(url);

  triggerToast({
    title: i18n.t(`command_k.export_public_addresses.toast.title`),
    description: i18n.t(`command_k.export_public_addresses.toast.description`),
  });
};
