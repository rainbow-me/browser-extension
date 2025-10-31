import { useEffect, useMemo } from 'react';

import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';

export type ModifierKey = 'ctrlKey' | 'altKey' | 'shiftKey' | 'command';

interface KeyboardShortcutConfig {
  condition?: () => boolean;
  enableWithinCommandK?: boolean;
  handler: (e: KeyboardEvent) => void;
  modifierKey?: ModifierKey;
}

const getSystemSpecificModifierKey = (modifierKey: ModifierKey | undefined) => {
  if (modifierKey === 'command') {
    // Use Command key on Mac, Control on other platforms
    return navigator.userAgent.includes('Mac') ? 'metaKey' : 'ctrlKey';
  }
  return modifierKey;
};

export function useKeyboardShortcut({
  condition,
  enableWithinCommandK,
  handler,
  modifierKey,
}: KeyboardShortcutConfig) {
  const isCommandKVisible = useCommandKStatus((s) => s.isCommandKVisible);

  const shouldListen = useMemo(() => {
    return !isCommandKVisible || enableWithinCommandK;
  }, [enableWithinCommandK, isCommandKVisible]);

  useEffect(() => {
    const systemSpecificModifierKey = getSystemSpecificModifierKey(modifierKey);
    const modifiedHandler = (e: KeyboardEvent) => {
      // Block when CommandK is open unless explicitly allowed
      if (isCommandKVisible && !enableWithinCommandK) {
        return;
      }
      // Check condition on every keypress, not just at registration time
      if (condition && !condition()) {
        return;
      }
      // If a modifierKey is specified, check if it's being held down
      if (systemSpecificModifierKey && !e[systemSpecificModifierKey]) {
        return;
      }
      handler(e);
    };

    const addHandler = () =>
      document.addEventListener('keydown', modifiedHandler);
    const removeHandler = () =>
      document.removeEventListener('keydown', modifiedHandler);

    if (shouldListen) {
      addHandler();
    } else {
      removeHandler();
    }

    return () => {
      removeHandler();
    };
  }, [
    condition,
    enableWithinCommandK,
    handler,
    isCommandKVisible,
    modifierKey,
    shouldListen,
  ]);
}
