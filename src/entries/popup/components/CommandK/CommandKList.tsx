import { useVirtualizer } from '@tanstack/react-virtual';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Stack, Symbol, Text, TextOverflow } from '~/design-system';

import { LIST_HEIGHT, MODAL_HEIGHT } from './CommandKModal';
import { TOOLBAR_HEIGHT } from './CommandKToolbar';
import {
  COMMAND_ROW_HEIGHT,
  NFTRow,
  ShortcutRow,
  TokenRow,
  WalletRow,
} from './CommandRows';
import {
  ENSOrAddressSearchItem,
  NFTSearchItem,
  SearchItem,
  SearchItemType,
  ShortcutSearchItem,
  TokenSearchItem,
  WalletSearchItem,
} from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { timingConfig } from './references';
import { CommandKPageState } from './useCommandKNavigation';
import { useCommandKStatus } from './useCommandKStatus';
import { SCROLL_TO_BEHAVIOR } from './utils';

const LIST_HEADER_HEIGHT = 28;

function getPageTitle(
  currentPage: CommandKPage,
  command: SearchItem | null,
  searchQuery: string,
): string {
  if (searchQuery && currentPage === PAGES.HOME) {
    return i18n.t('command_k.pages.home.section_title_results');
  }

  const title = currentPage.listTitle;

  if (typeof title === 'string') {
    return title;
  } else if (command) {
    return title(command);
  }

  return '';
}

export const CommandKList = React.forwardRef<
  HTMLDivElement,
  {
    currentPage: CommandKPage;
    didScrollOrNavigate: boolean;
    filteredCommands: SearchItem[];
    handleExecuteCommand: (command: SearchItem, e?: KeyboardEvent) => void;
    previousPageState: CommandKPageState;
    searchQuery: string;
    selectedCommand: SearchItem | null;
    selectedCommandIndex: number;
    setDidScrollOrNavigate: (value: boolean) => void;
  }
>(
  (
    {
      currentPage,
      didScrollOrNavigate,
      filteredCommands,
      handleExecuteCommand,
      previousPageState,
      searchQuery,
      selectedCommand,
      selectedCommandIndex,
      setDidScrollOrNavigate,
    },
    ref,
  ) => {
    const { isCommandKVisible } = useCommandKStatus();

    const listVirtualizer = useVirtualizer({
      count: (filteredCommands?.length || 0) + 1,
      estimateSize: (index) =>
        index === 0 ? LIST_HEADER_HEIGHT : COMMAND_ROW_HEIGHT,
      getScrollElement: () => (ref as React.RefObject<HTMLDivElement>).current,
      overscan: 20,
      paddingEnd: 8,
      scrollPaddingEnd: 8,
      scrollPaddingStart: 8,
    });

    const enableRowHover = () => {
      if (didScrollOrNavigate) {
        setDidScrollOrNavigate(false);
      }
    };

    const disableRowHover = (e: React.WheelEvent<HTMLDivElement>) => {
      if (didScrollOrNavigate) {
        return;
      }

      const atTop = e.currentTarget.scrollTop === 0;
      const atBottom =
        e.currentTarget.scrollTop + e.currentTarget.clientHeight ===
        e.currentTarget.scrollHeight;

      if (!((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom))) {
        setDidScrollOrNavigate(true);
      }
    };

    React.useLayoutEffect(() => {
      if (isCommandKVisible && selectedCommandIndex !== -1) {
        listVirtualizer.scrollToIndex(selectedCommandIndex + 1, {
          align: 'auto',
          behavior: SCROLL_TO_BEHAVIOR,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCommandKVisible, selectedCommandIndex]);

    const shouldShowEmptyState =
      !filteredCommands || filteredCommands.length === 0;
    const listHeight = shouldShowEmptyState
      ? LIST_HEIGHT + TOOLBAR_HEIGHT
      : LIST_HEIGHT;

    return (
      <Box
        onClick={enableRowHover}
        onMouseMove={enableRowHover}
        onWheel={disableRowHover}
        position="relative"
        ref={ref}
        style={{
          height: listHeight,
          overflowY: 'scroll',
        }}
      >
        <AnimatePresence initial={false}>
          {shouldShowEmptyState ? (
            <CommandKEmptyState
              currentPage={currentPage}
              height={listHeight}
              searchQuery={searchQuery}
            />
          ) : (
            <Box
              style={{
                pointerEvents: didScrollOrNavigate ? 'none' : 'auto',
              }}
            >
              <Box
                style={{
                  height: listVirtualizer.getTotalSize(),
                  position: 'relative',
                }}
              >
                {listVirtualizer.getVirtualItems().map((virtualItem) => {
                  const { index, key, start, size } = virtualItem;

                  if (index === 0) {
                    return (
                      <Box
                        key={key}
                        position="absolute"
                        style={{ height: size, top: start }}
                        width="full"
                      >
                        <CommandKListHeader
                          title={getPageTitle(
                            currentPage,
                            previousPageState.selectedCommand,
                            searchQuery,
                          )}
                        />
                      </Box>
                    );
                  }

                  const commandIndex = index - 1;
                  const command = filteredCommands[commandIndex];
                  const isSelected =
                    (selectedCommand && selectedCommand.id === command.id) ??
                    false;

                  let row;

                  if (command.type === SearchItemType.Shortcut) {
                    row = (
                      <ShortcutRow
                        command={command as ShortcutSearchItem}
                        handleExecuteCommand={handleExecuteCommand}
                        key={command.id}
                        selected={isSelected}
                      />
                    );
                  } else if (
                    command.type === SearchItemType.ENSOrAddressResult ||
                    command.type === SearchItemType.Wallet
                  ) {
                    row = (
                      <WalletRow
                        command={
                          command.type === SearchItemType.Wallet
                            ? (command as WalletSearchItem)
                            : (command as ENSOrAddressSearchItem)
                        }
                        handleExecuteCommand={handleExecuteCommand}
                        key={command.id}
                        selected={isSelected}
                      />
                    );
                  } else if (command.type === SearchItemType.Token) {
                    row = (
                      <TokenRow
                        command={command as TokenSearchItem}
                        handleExecuteCommand={handleExecuteCommand}
                        key={command.id}
                        selected={isSelected}
                      />
                    );
                  } else if (command.type === SearchItemType.NFT) {
                    row = (
                      <NFTRow
                        command={command as NFTSearchItem}
                        handleExecuteCommand={handleExecuteCommand}
                        key={command.id}
                        selected={isSelected}
                      />
                    );
                  }

                  return (
                    <Box
                      key={key}
                      position="absolute"
                      style={{ height: size, top: start }}
                      width="full"
                    >
                      {row}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    );
  },
);

CommandKList.displayName = 'CommandKList';

export function CommandKEmptyState({
  currentPage,
  height = LIST_HEIGHT,
  searchQuery,
}: {
  currentPage: CommandKPage;
  height?: number;
  searchQuery: string;
}) {
  return (
    <Box
      alignItems="center"
      animate={{ opacity: 1, scale: 1, y: 0 }}
      as={motion.div}
      display="flex"
      exit={{ opacity: 0, scale: 0.8, y: 0 }}
      height="full"
      initial={{ opacity: 0, scale: 0.8, y: 0 }}
      justifyContent="center"
      key="commandKEmptyState"
      position="relative"
      style={{
        height: height,
        paddingBottom: MODAL_HEIGHT - height,
      }}
      transition={timingConfig(0.2)}
    >
      <Stack alignHorizontal="center" space="12px">
        <Symbol
          color="labelQuaternary"
          size={32}
          symbol="magnifyingglass.circle.fill"
          weight="bold"
        />
        <Text color="labelQuaternary" size="20pt" weight="bold">
          {!searchQuery && currentPage.emptyLabel
            ? currentPage.emptyLabel
            : i18n.t('command_k.no_results')}
        </Text>
      </Stack>
    </Box>
  );
}

export function CommandKListHeader({ title }: { title: string }) {
  return (
    <Box
      style={{ height: LIST_HEADER_HEIGHT }}
      paddingBottom="6px"
      paddingHorizontal="14px"
      paddingTop="14px"
    >
      <TextOverflow color="labelTertiary" size="12pt" weight="semibold">
        {title}
      </TextOverflow>
    </Box>
  );
}
