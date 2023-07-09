import React from 'react';

import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';

import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';
import {
  ShortcutCommand,
  useCommands,
} from '../components/CommandK/useCommands';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useCommandKInternalShortcuts(
  handleExecuteCommand: (command: ShortcutCommand | null) => void,
) {
  const { shortcutList } = useCommands();
  const { isCommandKVisible } = useCommandKStatus();
  const { featureFlags } = useFeatureFlagsStore();

  const keyToShortcutMap = React.useMemo(() => {
    const map = new Map();
    shortcutList.forEach((shortcut) => {
      if (shortcut.shortcut) {
        map.set(shortcut.shortcut.key, shortcut);
      }
    });
    return map;
  }, [shortcutList]);

  const getCommandKShortcutsAreEnabled = React.useCallback(() => {
    return isCommandKVisible && featureFlags.command_k_shortcuts_enabled;
  }, [isCommandKVisible, featureFlags.command_k_shortcuts_enabled]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      const command = keyToShortcutMap.get(e.key);
      if (command) {
        e.preventDefault();
        handleExecuteCommand(command);
      }
    },
    condition: getCommandKShortcutsAreEnabled,
    modifierKey: 'command',
  });
}
