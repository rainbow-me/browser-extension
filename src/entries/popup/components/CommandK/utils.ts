import * as React from 'react';

import { shortcuts } from '~/core/references/shortcuts';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { useCommandKStatus } from './useCommandKStatus';
import { ShortcutCommand } from './useCommands';

export const SCROLL_TO_BEHAVIOR = 'auto';

interface ShortcutCommandWithRelevance extends ShortcutCommand {
  relevance: number;
}

interface CacheItem {
  [name: string]: number;
}

const calculateCommandRelevance = (
  command: ShortcutCommand,
  query: string,
): number => {
  if (query === '') {
    return 0;
  } else {
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(' ').filter(Boolean);

    const normalizedCommandName = command.name.toLowerCase();
    const commandNameWords = normalizedCommandName.split(' ');

    // High relevance: Command name starts with query
    if (
      !command.downrank &&
      normalizedCommandName.startsWith(normalizedQuery)
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

    return 0;
  }
};

const memoize = (
  search: (
    query: string,
    shortcutList: ShortcutCommand[],
  ) => ShortcutCommandWithRelevance[],
) => {
  const resultsCache = new Map<string, CacheItem>();

  return (
    query: string,
    shortcutList: ShortcutCommand[],
  ): ShortcutCommandWithRelevance[] => {
    if (query === '') {
      return shortcutList.map((sc) => ({ ...sc, relevance: 0 }));
    }

    if (!resultsCache.has(query)) {
      const result = search(query, shortcutList);
      const cacheItem: CacheItem = {};
      result.forEach((item) => (cacheItem[item.name] = item.relevance));
      resultsCache.set(query, cacheItem);
    }

    const cachedItem = resultsCache.get(query) as CacheItem;

    return shortcutList
      .map((sc) => ({ ...sc, relevance: cachedItem[sc.name] || 0 }))
      .filter((sc) => sc.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);
  };
};

export const filterAndSortShortcuts = memoize(
  (
    query: string,
    shortcutList: ShortcutCommand[],
  ): ShortcutCommandWithRelevance[] => {
    const shortcutWithRelevance: ShortcutCommandWithRelevance[] = [];

    for (const command of shortcutList) {
      const relevance = calculateCommandRelevance(command, query);

      if (relevance > 0) {
        shortcutWithRelevance.push({ ...command, relevance });
      }
    }

    return shortcutWithRelevance.sort((a, b) => b.relevance - a.relevance);
  },
);

export function useCommandExecution(
  clearSearch: () => void,
  shortcutList: ShortcutCommand[],
) {
  const { closeCommandK } = useCommandKStatus();
  const navigate = useRainbowNavigate();
  const [selectedCommand, setSelectedCommand] =
    React.useState<ShortcutCommand | null>(shortcutList[0]);

  const handleExecuteCommand = React.useCallback(
    (command: ShortcutCommand | null) => {
      if (command) {
        closeCommandK({ refocus: command.shouldRemainOnActiveRoute ?? false });
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
        setSelectedCommand(shortcutList[0]);
      }
    },
    [clearSearch, closeCommandK, navigate, shortcutList],
  );

  return { selectedCommand, setSelectedCommand, handleExecuteCommand };
}

export function useKeyboardNavigation(
  didScrollOrNavigate: boolean,
  filteredShortcuts: ShortcutCommand[],
  handleExecuteCommand: (command: ShortcutCommand | null) => void,
  listRef: React.RefObject<HTMLDivElement>,
  selectedCommand: ShortcutCommand | null,
  selectedCommandIndex: number,
  setDidScrollOrNavigate: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedCommand: React.Dispatch<
    React.SetStateAction<ShortcutCommand | null>
  >,
) {
  const scrollTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Handle arrow key and tab navigation
  const handleKeyboardNavigation = React.useCallback(
    (e: KeyboardEvent) => {
      const { key, shiftKey } = e;
      const isArrowUp = key === 'ArrowUp';
      const isArrowDown = key === 'ArrowDown';
      const isTab = key === 'Tab';

      if (isArrowUp || isArrowDown || isTab) {
        e.preventDefault();

        if (filteredShortcuts.length === 0) {
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

        if (isArrowUp || (isTab && shiftKey)) {
          newSelectedCommandIndex =
            isTab && selectedCommandIndex === 0
              ? filteredShortcuts.length - 1
              : Math.max(selectedCommandIndex - 1, 0);
          if (isArrowUp && selectedCommandIndex === 0) {
            listRef.current?.scrollTo({
              top: 0,
              behavior: SCROLL_TO_BEHAVIOR,
            });
          }
        } else if (
          isTab &&
          selectedCommandIndex === filteredShortcuts.length - 1
        ) {
          newSelectedCommandIndex = 0;
          listRef.current?.scrollTo({
            top: 0,
            behavior: SCROLL_TO_BEHAVIOR,
          });
        } else {
          newSelectedCommandIndex = Math.min(
            selectedCommandIndex + 1,
            filteredShortcuts.length - 1,
          );
        }

        const firstCommandIsSelected = newSelectedCommandIndex === 0;
        const lastCommandIsSelected =
          newSelectedCommandIndex === filteredShortcuts.length - 1;
        const selectedCommandDidChange =
          newSelectedCommandIndex !== selectedCommandIndex;

        const scrollPositionShouldUpdate =
          (firstCommandIsSelected &&
            !selectedCommandDidChange &&
            !listIsScrolledToTop) ||
          (lastCommandIsSelected &&
            !selectedCommandDidChange &&
            !listIsScrolledToBottom);

        const newSelectedCommand = filteredShortcuts[newSelectedCommandIndex];

        if (selectedCommandDidChange || scrollPositionShouldUpdate) {
          if (!didScrollOrNavigate) {
            // Disable hover if the selected list item changes via keyboard input
            setDidScrollOrNavigate(true);
          }
          setSelectedCommand(newSelectedCommand);
        }
      } else if (selectedCommand && key === shortcuts.global.SELECT.key) {
        handleExecuteCommand(selectedCommand);
      }
    },
    [
      didScrollOrNavigate,
      filteredShortcuts,
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
