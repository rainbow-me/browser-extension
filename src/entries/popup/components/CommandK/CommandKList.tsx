import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Stack, Symbol, Text } from '~/design-system';

import { LIST_HEIGHT, MODAL_HEIGHT } from './CommandKModal';
import { ShortcutRow } from './ShortcutRow';
import { useCommandKStatus } from './useCommandKStatus';
import { ShortcutCommand, useCommands } from './useCommands';
import { SCROLL_TO_BEHAVIOR } from './utils';

const LIST_HEADER_HEIGHT = 28;

export const CommandKList = React.forwardRef<
  HTMLDivElement,
  {
    didScrollOrNavigate: boolean;
    filteredShortcuts: ShortcutCommand[];
    handleExecuteCommand: (command: ShortcutCommand | null) => void;
    selectedCommand: ShortcutCommand | null;
    selectedCommandIndex: number;
    setDidScrollOrNavigate: (value: boolean) => void;
  }
>(
  (
    {
      didScrollOrNavigate,
      filteredShortcuts,
      handleExecuteCommand,
      selectedCommand,
      selectedCommandIndex,
      setDidScrollOrNavigate,
    },
    ref,
  ) => {
    const { shortcutList } = useCommands();
    const { isCommandKVisible } = useCommandKStatus();

    const shortcutRowRefs = React.useRef<React.RefObject<HTMLDivElement>[]>(
      shortcutList.map(() => React.createRef()),
    );

    const enableRowHover = () => {
      if (didScrollOrNavigate) {
        setDidScrollOrNavigate(false);
      }
    };

    const disableRowHover = (e: React.WheelEvent<HTMLDivElement>) => {
      const atTop = e.currentTarget.scrollTop === 0;
      const atBottom =
        e.currentTarget.scrollTop + e.currentTarget.clientHeight ===
        e.currentTarget.scrollHeight;

      if (!((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom))) {
        if (!didScrollOrNavigate) {
          setDidScrollOrNavigate(true);
        }
      }
    };

    React.useLayoutEffect(() => {
      if (
        isCommandKVisible &&
        selectedCommandIndex !== -1 &&
        shortcutRowRefs.current[selectedCommandIndex]
      ) {
        const currentItem =
          shortcutRowRefs.current[selectedCommandIndex].current;
        if (currentItem) {
          currentItem.scrollIntoView({
            behavior: SCROLL_TO_BEHAVIOR,
            block: 'nearest',
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCommandKVisible, selectedCommand]);

    const shortcutRows = React.useMemo(
      () =>
        (filteredShortcuts ?? []).map((shortcut, index) => (
          <ShortcutRow
            handleExecuteCommand={handleExecuteCommand}
            key={shortcut.id}
            ref={shortcutRowRefs.current[index]}
            selected={
              (selectedCommand && selectedCommand.id === shortcut.id) ?? false
            }
            shortcut={shortcut}
          />
        )),
      [
        filteredShortcuts,
        handleExecuteCommand,
        selectedCommand,
        shortcutRowRefs,
      ],
    );

    const shouldShowEmptyState =
      !filteredShortcuts || filteredShortcuts.length === 0;

    return (
      <Box
        onClick={enableRowHover}
        onMouseMove={enableRowHover}
        onWheel={disableRowHover}
        position="relative"
        ref={ref}
        style={{
          height: LIST_HEIGHT,
          overflowY: 'scroll',
          overscrollBehaviorY: 'none',
          paddingBottom: 8,
          scrollPaddingBlockEnd: shouldShowEmptyState ? 0 : 8,
          scrollPaddingBlockStart: shouldShowEmptyState ? 0 : 8,
        }}
      >
        {shouldShowEmptyState ? (
          <CommandKEmptyState />
        ) : (
          <Box
            style={{
              pointerEvents: didScrollOrNavigate ? 'none' : 'auto',
            }}
          >
            <Stack>
              <CommandKListHeader
                title={i18n.t('command_k.section_titles.shortcuts')}
              />
              {shortcutRows}
            </Stack>
          </Box>
        )}
      </Box>
    );
  },
);

CommandKList.displayName = 'CommandKList';

export function CommandKEmptyState({
  height = LIST_HEIGHT,
}: {
  height?: number;
}) {
  return (
    <Box
      alignItems="center"
      animate={{ opacity: 1, scale: 1 }}
      as={motion.div}
      display="flex"
      exit={{ opacity: 0, scale: 0.8 }}
      height="full"
      initial={{ opacity: 0, scale: 0.9 }}
      justifyContent="center"
      position="relative"
      style={{
        height: height,
        paddingBottom: MODAL_HEIGHT - LIST_HEIGHT,
      }}
    >
      <Stack alignHorizontal="center" space="12px">
        <Symbol
          color="labelQuaternary"
          size={32}
          symbol="magnifyingglass.circle.fill"
          weight="bold"
        />
        <Text color="labelQuaternary" size="20pt" weight="bold">
          {i18n.t('command_k.no_results')}
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
      <Text color="labelTertiary" size="12pt" weight="semibold">
        {title}
      </Text>
    </Box>
  );
}
