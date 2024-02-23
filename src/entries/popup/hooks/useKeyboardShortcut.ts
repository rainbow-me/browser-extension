import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCommandKStatus } from '../components/CommandK/useCommandKStatus';

export type ModifierKey = 'ctrlKey' | 'altKey' | 'shiftKey' | 'command';

interface KeyboardShortcutConfig {
  condition?: boolean;
  enableWithinCommandK?: boolean;
  handler: (e: KeyboardEvent) => void;
  modifierKey?: ModifierKey;
}

export function useKeyboardShortcut({
  condition,
  enableWithinCommandK,
  handler,
  modifierKey,
}: KeyboardShortcutConfig) {
  const [handlerAdded, setHandlerAdded] = useState(false);
  const { isCommandKVisible } = useCommandKStatus();

  const systemSpecificModifierKey = useMemo(() => {
    if (modifierKey === 'command') {
      // Use Command key on Mac, Control on other platforms
      return navigator.userAgent.includes('Mac') ? 'metaKey' : 'ctrlKey';
    }
    return modifierKey;
  }, [modifierKey]);

  const modifiedHandler = useCallback(
    (e: KeyboardEvent) => {
      // If a modifierKey is specified, check if it's being held down
      if (systemSpecificModifierKey && !e[systemSpecificModifierKey]) {
        return;
      }
      if (!isCommandKVisible || enableWithinCommandK) {
        if (condition || condition === undefined) {
          handler(e);
        }
      }
    },
    [
      condition,
      enableWithinCommandK,
      handler,
      isCommandKVisible,
      systemSpecificModifierKey,
    ],
  );

  const addHandler = useCallback(
    () => document.addEventListener('keydown', modifiedHandler),
    [modifiedHandler],
  );
  const removeHandler = useCallback(
    () => document.removeEventListener('keydown', modifiedHandler),
    [modifiedHandler],
  );

  useEffect(() => {
    addHandler();
    return () => removeHandler();
  }, [addHandler, removeHandler]);
}
