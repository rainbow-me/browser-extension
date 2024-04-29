import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import React from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Separator, Symbol } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { transitions } from '~/design-system/styles/designTokens';
import { useCommandKInternalShortcuts } from '~/entries/popup/hooks/useCommandKInternalShortcuts';
import useScrollLock from '~/entries/popup/hooks/useScrollLock';

import AnimatedLoadingBar from './AnimatedLoadingBar';
import { CommandKList } from './CommandKList';
import { CommandKModal } from './CommandKModal';
import { SearchItem } from './SearchItems';
import { CommandKPage, PAGES } from './pageConfig';
import { springConfig } from './references';
import { useCommandKNavigation } from './useCommandKNavigation';
import { useCommandKStatus } from './useCommandKStatus';
import { useCommands } from './useCommands';
import {
  SCROLL_TO_BEHAVIOR,
  filterAndSortCommands,
  useCommandExecution,
  useKeyboardNavigation,
} from './utils';

export const CommandK = () => {
  const { isCommandKVisible, isFetching } = useCommandKStatus();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [didScrollOrNavigate, setDidScrollOrNavigate] = React.useState(false);

  const [selectedCommand, setSelectedCommand] =
    React.useState<SearchItem | null>(null);
  const [selectedCommandNeedsUpdate, setSelectedCommandNeedsUpdate] =
    React.useState<boolean>(false);

  const backAnimation = useAnimation();
  const [skipBackAnimation, setSkipBackAnimation] = React.useState(false);
  const runBackAnimation = async (scaleTarget: number) => {
    await backAnimation.start({
      scale: scaleTarget,
      transition: { duration: 0.15 },
    });
    backAnimation.start({
      scale: 1,
      transition: springConfig,
    });
  };

  const clearSearch = React.useCallback(() => {
    if (searchQuery) {
      setSearchQuery('');
    }
  }, [searchQuery, setSearchQuery]);

  const {
    clearPageState,
    currentPage,
    goBack,
    lastDirection,
    navigateTo,
    previousPageState,
  } = useCommandKNavigation({
    clearSearch,
    inputRef,
    listRef,
    searchQuery,
    setSearchQuery,
    setSelectedCommand,
  });

  const { commandList } = useCommands(
    currentPage,
    previousPageState,
    searchQuery,
    setSelectedCommandNeedsUpdate,
  );

  const filteredCommands = React.useMemo(() => {
    return filterAndSortCommands(commandList, currentPage, searchQuery);
  }, [commandList, currentPage, searchQuery]);

  const { handleExecuteCommand } = useCommandExecution(
    clearPageState,
    clearSearch,
    commandList,
    navigateTo,
    selectedCommand,
    setDidScrollOrNavigate,
    setSelectedCommand,
  );

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

  React.useLayoutEffect(() => {
    if (isCommandKVisible) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      setSelectedCommand(filteredCommands[0]);
      setDidScrollOrNavigate(true);
      listRef.current?.scrollTo({
        top: 0,
        behavior: SCROLL_TO_BEHAVIOR,
      });
      if (searchQuery) {
        inputRef.current?.select();
      }
    } else {
      inputRef.current?.blur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommandKVisible]);

  React.useLayoutEffect(() => {
    if (selectedCommandNeedsUpdate) {
      setSelectedCommand(filteredCommands[0]);
      setSelectedCommandNeedsUpdate(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: 0,
          behavior: SCROLL_TO_BEHAVIOR,
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommandNeedsUpdate]);

  React.useLayoutEffect(() => {
    if (!lastDirection) {
      setSelectedCommand(filteredCommands[0]);
    } else if (lastDirection === 'forward') {
      setSelectedCommand(filteredCommands[0]);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: 0,
          behavior: SCROLL_TO_BEHAVIOR,
        });
      });
    } else {
      if (!skipBackAnimation) {
        runBackAnimation(0.975);
      } else {
        setSkipBackAnimation(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const selectedCommandIndex = React.useMemo(
    () =>
      (filteredCommands ?? []).findIndex(
        (command) => command.id === selectedCommand?.id,
      ),
    [filteredCommands, selectedCommand],
  );

  useCommandKInternalShortcuts(
    commandList,
    currentPage,
    goBack,
    handleExecuteCommand,
    searchQuery,
    setDidScrollOrNavigate,
  );
  useScrollLock(isCommandKVisible);

  return (
    <CommandKModal
      backAnimation={backAnimation}
      handleExecuteCommand={handleExecuteCommand}
      navigateTo={navigateTo}
      selectedCommand={selectedCommand}
    >
      <CommandKInput
        currentPage={currentPage}
        didScrollOrNavigate={didScrollOrNavigate}
        filteredCommands={filteredCommands ?? []}
        goBack={goBack}
        handleBlur={(e) => handleBlur(e)}
        handleExecuteCommand={handleExecuteCommand}
        inputRef={inputRef}
        isFetching={isFetching}
        listRef={listRef}
        searchQuery={searchQuery}
        selectedCommand={selectedCommand}
        selectedCommandIndex={selectedCommandIndex}
        setDidScrollOrNavigate={setDidScrollOrNavigate}
        setSearchQuery={setSearchQuery}
        setSelectedCommand={setSelectedCommand}
        setSelectedCommandNeedsUpdate={setSelectedCommandNeedsUpdate}
        setSkipBackAnimation={setSkipBackAnimation}
      />
      <CommandKList
        currentPage={currentPage}
        didScrollOrNavigate={didScrollOrNavigate}
        filteredCommands={filteredCommands ?? []}
        handleExecuteCommand={handleExecuteCommand}
        previousPageState={previousPageState}
        ref={listRef}
        searchQuery={searchQuery}
        selectedCommand={selectedCommand}
        selectedCommandIndex={selectedCommandIndex}
        setDidScrollOrNavigate={setDidScrollOrNavigate}
      />
    </CommandKModal>
  );
};

interface CommandKInputProps {
  currentPage: CommandKPage;
  didScrollOrNavigate: boolean;
  filteredCommands: SearchItem[];
  goBack: () => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleExecuteCommand: (command: SearchItem | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isFetching: boolean;
  listRef: React.RefObject<HTMLDivElement>;
  searchQuery: string;
  selectedCommand: SearchItem | null;
  selectedCommandIndex: number;
  setDidScrollOrNavigate: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCommand: React.Dispatch<React.SetStateAction<SearchItem | null>>;
  setSelectedCommandNeedsUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  setSkipBackAnimation: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CommandKInput = React.memo(function CommandKInput({
  currentPage,
  didScrollOrNavigate,
  filteredCommands,
  goBack,
  handleBlur,
  handleExecuteCommand,
  inputRef,
  isFetching,
  listRef,
  searchQuery,
  selectedCommand,
  selectedCommandIndex,
  setDidScrollOrNavigate,
  setSearchQuery,
  setSelectedCommand,
  setSelectedCommandNeedsUpdate,
  setSkipBackAnimation,
}: CommandKInputProps) {
  const { currentTheme } = useCurrentThemeStore();

  const onSearchQueryChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedSearchQuery = e.target.value;
      setSearchQuery(updatedSearchQuery);
      setSelectedCommandNeedsUpdate(true);
      if (!didScrollOrNavigate) {
        setDidScrollOrNavigate(true);
      }
      listRef.current?.scrollTo({
        top: 0,
        behavior: SCROLL_TO_BEHAVIOR,
      });
    },
    [
      didScrollOrNavigate,
      listRef,
      setDidScrollOrNavigate,
      setSearchQuery,
      setSelectedCommandNeedsUpdate,
    ],
  );

  useKeyboardNavigation(
    didScrollOrNavigate,
    filteredCommands,
    handleExecuteCommand,
    listRef,
    selectedCommand,
    selectedCommandIndex,
    setDidScrollOrNavigate,
    setSelectedCommand,
  );

  return (
    <Box position="relative">
      <SearchInputIcon
        currentPage={currentPage}
        goBack={goBack}
        setSkipBackAnimation={setSkipBackAnimation}
      />
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
        placeholder={currentPage.searchPlaceholder}
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
      <Box
        opacity={currentTheme === 'dark' ? '0.5' : '0.6'}
        position="relative"
      >
        <Separator color="separatorSecondary" />
        <AnimatedLoadingBar isFetching={isFetching} />
      </Box>
    </Box>
  );
});

function SearchInputIcon({
  currentPage,
  goBack,
  setSkipBackAnimation,
}: {
  currentPage: CommandKPage;
  goBack: () => void;
  setSkipBackAnimation: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { currentTheme } = useCurrentThemeStore();

  return (
    <AnimatePresence initial={false}>
      {currentPage === PAGES.HOME && (
        <Box
          alignItems="center"
          animate={{ opacity: 1, scale: 1, x: 0 }}
          aria-hidden="true"
          as={motion.div}
          display="flex"
          exit={{ opacity: 0, scale: 0.8, x: -2 }}
          initial={{ opacity: 0, scale: 0.8, x: -2 }}
          justifyContent="center"
          key="commandKSearchIcon"
          position="absolute"
          style={{
            height: 20,
            left: 18,
            pointerEvents: 'none',
            top: 18,
            width: 20,
            willChange: 'transform',
            zIndex: 3,
          }}
          transition={transitions.bounce}
        >
          <Symbol
            color="label"
            size={16}
            symbol="magnifyingglass"
            weight="semibold"
          />
        </Box>
      )}
      {currentPage !== PAGES.HOME && (
        <Box
          alignItems="center"
          animate={{ opacity: 1, scale: 1 }}
          as={motion.div}
          borderRadius="round"
          display="flex"
          exit={{ opacity: 0, scale: 0.8 }}
          initial={{ opacity: 0, scale: 0.8 }}
          justifyContent="center"
          key="commandKBackIcon"
          onClick={() => {
            setSkipBackAnimation(true);
            goBack();
          }}
          position="absolute"
          style={{
            background:
              currentTheme === 'dark'
                ? 'rgba(245, 248, 255, 0.06)'
                : 'rgba(255, 255, 255, 0.4)',
            boxShadow:
              currentTheme === 'dark'
                ? '0 3px 9px 0 rgba(0, 0, 0, 0.05), 0 -1px 6px 0 rgba(245, 248, 255, 0.05) inset, 0 0.5px 2px 0 rgba(245, 248, 255, 0.07) inset'
                : '0 3px 9px 0 rgba(0, 0, 0, 0.01), 0 -1px 6px 0 #FFFFFF inset, 0 0.5px 2px 0 #FFFFFF inset',
            height: 24,
            left: 14,
            top: 16,
            width: 24,
            willChange: 'transform',
            zIndex: 3,
          }}
          transition={transitions.bounce}
          whileHover={{ scale: 1.06, transition: transitions.bounce }}
          whileTap={{ scale: 0.94, transition: transitions.bounce }}
        >
          <Symbol
            color="labelSecondary"
            size={11.35}
            symbol="arrow.left"
            weight="bold"
          />
        </Box>
      )}
    </AnimatePresence>
  );
}
