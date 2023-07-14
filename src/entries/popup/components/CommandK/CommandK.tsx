import React from 'react';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Separator, Symbol } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { useCommandKInternalShortcuts } from '~/entries/popup/hooks/useCommandKInternalShortcuts';
import useScrollLock from '~/entries/popup/hooks/useScrollLock';

import { CommandKList } from './CommandKList';
import { CommandKModal } from './CommandKModal';
import { useCommandKStatus } from './useCommandKStatus';
import { ShortcutCommand, useCommands } from './useCommands';
import {
  SCROLL_TO_BEHAVIOR,
  filterAndSortShortcuts,
  useCommandExecution,
  useKeyboardNavigation,
} from './utils';

export const CommandK = () => {
  const { shortcutList } = useCommands();
  const { isCommandKVisible } = useCommandKStatus();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [didScrollOrNavigate, setDidScrollOrNavigate] = React.useState(false);

  const clearSearch = React.useCallback(() => {
    if (searchQuery) {
      setSearchQuery('');
    }
  }, [searchQuery, setSearchQuery]);

  const { selectedCommand, setSelectedCommand, handleExecuteCommand } =
    useCommandExecution(clearSearch, shortcutList);

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Check if blur event is due to unmount
      if (e.relatedTarget === null) return;

      if (isCommandKVisible) {
        inputRef.current?.focus();
      }
    },
    [isCommandKVisible],
  );

  React.useEffect(() => {
    if (isCommandKVisible) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      setDidScrollOrNavigate(true);
      if (searchQuery) {
        inputRef.current?.select();
      }
    } else {
      inputRef.current?.blur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommandKVisible]);

  const filteredShortcuts = React.useMemo(() => {
    return filterAndSortShortcuts(searchQuery, shortcutList);
  }, [searchQuery, shortcutList]);

  const selectedCommandIndex = React.useMemo(
    () =>
      (filteredShortcuts ?? []).findIndex(
        (shortcut) => shortcut.id === selectedCommand?.id,
      ),
    [filteredShortcuts, selectedCommand],
  );

  useCommandKInternalShortcuts(handleExecuteCommand);
  useScrollLock(isCommandKVisible);

  return (
    <CommandKModal>
      <CommandKInput
        didScrollOrNavigate={didScrollOrNavigate}
        filteredShortcuts={filteredShortcuts ?? []}
        handleBlur={(e) => handleBlur(e)}
        handleExecuteCommand={handleExecuteCommand}
        inputRef={inputRef}
        listRef={listRef}
        searchQuery={searchQuery}
        selectedCommand={selectedCommand}
        selectedCommandIndex={selectedCommandIndex}
        setDidScrollOrNavigate={setDidScrollOrNavigate}
        setSearchQuery={setSearchQuery}
        setSelectedCommand={setSelectedCommand}
        shortcutList={shortcutList}
      />
      <CommandKList
        didScrollOrNavigate={didScrollOrNavigate}
        filteredShortcuts={filteredShortcuts ?? []}
        handleExecuteCommand={handleExecuteCommand}
        ref={listRef}
        selectedCommand={selectedCommand}
        selectedCommandIndex={selectedCommandIndex}
        setDidScrollOrNavigate={setDidScrollOrNavigate}
      />
    </CommandKModal>
  );
};

interface CommandKInputProps {
  didScrollOrNavigate: boolean;
  filteredShortcuts: ShortcutCommand[];
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleExecuteCommand: (command: ShortcutCommand | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  listRef: React.RefObject<HTMLDivElement>;
  searchQuery: string;
  selectedCommand: ShortcutCommand | null;
  selectedCommandIndex: number;
  setDidScrollOrNavigate: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCommand: React.Dispatch<
    React.SetStateAction<ShortcutCommand | null>
  >;
  shortcutList: ShortcutCommand[];
}

export const CommandKInput = React.memo(
  ({
    didScrollOrNavigate,
    filteredShortcuts,
    handleBlur,
    handleExecuteCommand,
    inputRef,
    listRef,
    searchQuery,
    selectedCommand,
    selectedCommandIndex,
    setDidScrollOrNavigate,
    setSearchQuery,
    setSelectedCommand,
    shortcutList,
  }: CommandKInputProps) => {
    const { currentTheme } = useCurrentThemeStore();

    const onSearchQueryChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedSearchQuery = e.target.value;
        setSearchQuery(updatedSearchQuery);
        if (!didScrollOrNavigate) {
          setDidScrollOrNavigate(true);
        }
        if (updatedSearchQuery) {
          const fastFilteredShortcuts = filterAndSortShortcuts(
            updatedSearchQuery,
            shortcutList,
          );
          listRef.current?.scrollTo({
            top: 0,
            behavior: SCROLL_TO_BEHAVIOR,
          });
          setSelectedCommand(fastFilteredShortcuts?.[0] || null);
        } else {
          listRef.current?.scrollTo({
            top: 0,
            behavior: SCROLL_TO_BEHAVIOR,
          });
          setSelectedCommand(shortcutList[0]);
        }
      },
      [
        didScrollOrNavigate,
        listRef,
        setDidScrollOrNavigate,
        setSearchQuery,
        setSelectedCommand,
        shortcutList,
      ],
    );

    useKeyboardNavigation(
      didScrollOrNavigate,
      filteredShortcuts,
      handleExecuteCommand,
      listRef,
      selectedCommand,
      selectedCommandIndex,
      setDidScrollOrNavigate,
      setSelectedCommand,
    );

    return (
      <Box position="relative">
        <Box
          alignItems="center"
          aria-hidden="true"
          display="flex"
          justifyContent="center"
          style={{
            height: 20,
            left: 18,
            pointerEvents: 'none',
            top: 18,
            width: 20,
            zIndex: 3,
          }}
          position="absolute"
        >
          <Symbol
            weight="semibold"
            size={16}
            symbol="magnifyingglass"
            color="label"
          />
        </Box>
        <Input
          aria-activedescendant={selectedCommand?.id}
          aria-labelledby={selectedCommand?.name}
          autoFocus
          borderRadius="0"
          enableAccentCaretStyle
          enableAccentSelectionStyle
          fontSize="16pt"
          height="56px"
          innerRef={inputRef}
          onBlur={handleBlur}
          onChange={onSearchQueryChange}
          placeholder={i18n.t('command_k.search_placeholder')}
          role="combobox"
          spellCheck={false}
          style={{
            caretColor: accentColorAsHsl,
            paddingLeft: 46,
            paddingRight: 18,
          }}
          tabIndex={0}
          testId="command-k-input"
          value={searchQuery}
          variant="transparent"
        />
        <Box opacity={currentTheme === 'dark' ? '0.5' : '0.75'}>
          <Separator color="separatorSecondary" />
        </Box>
      </Box>
    );
  },
);

CommandKInput.displayName = 'CommandKInput';
