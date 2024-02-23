import React, { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';

import { SearchItem } from '../components/CommandK/SearchItems';
import { CommandKPage, PAGES } from '../components/CommandK/pageConfig';
import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useCommandKInternalShortcuts(
  commandList: SearchItem[],
  currentPage: CommandKPage,
  goBack: () => void,
  handleExecuteCommand: (command: SearchItem | null) => void,
  searchQuery: string,
  setDidScrollOrNavigate: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const { closeCommandK, isCommandKVisible } = useCommandKStatus();
  const { featureFlags } = useFeatureFlagsStore();

  const keyToShortcutMap = React.useMemo(() => {
    const map = new Map();
    commandList.forEach((command) => {
      if (command.shortcut) {
        map.set(command.shortcut.key, command);
      }
    });
    return map;
  }, [commandList]);

  const getCommandKShortcutsAreEnabled = React.useCallback(() => {
    return (
      isCommandKVisible && featureFlags.command_k_internal_shortcuts_enabled
    );
  }, [isCommandKVisible, featureFlags.command_k_internal_shortcuts_enabled]);

  const goBackOrCloseCommandKHandler = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        if (currentPage !== PAGES.HOME) {
          goBack();
          setDidScrollOrNavigate(true);
        } else {
          closeCommandK();
        }
      } else if (
        (e.key === 'ArrowLeft' || e.key === 'Backspace') &&
        e.repeat === false &&
        searchQuery === '' &&
        currentPage !== PAGES.HOME
      ) {
        e.preventDefault();
        goBack();
        setDidScrollOrNavigate(true);
      }
    },
    [closeCommandK, currentPage, goBack, searchQuery, setDidScrollOrNavigate],
  );

  const handleExecuteCommandShortcutHandler = useCallback(
    (e: KeyboardEvent) => {
      const command = keyToShortcutMap.get(e.key);
      if (command && command.page === currentPage) {
        e.preventDefault();
        handleExecuteCommand(command);
      }
    },
    [currentPage, handleExecuteCommand, keyToShortcutMap],
  );

  useKeyboardShortcut({
    handler: handleExecuteCommandShortcutHandler,
    condition: getCommandKShortcutsAreEnabled(),
    enableWithinCommandK: true,
    modifierKey: 'command',
  });

  useKeyboardShortcut({
    handler: goBackOrCloseCommandKHandler,
    condition: isCommandKVisible,
    enableWithinCommandK: true,
  });
}
