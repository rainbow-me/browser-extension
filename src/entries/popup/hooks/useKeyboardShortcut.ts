import { useCallback, useEffect, useMemo } from 'react';

type ModifierKey = 'ctrlKey' | 'altKey' | 'shiftKey' | 'command';

interface KeyboardShortcutConfig {
  condition?: () => boolean;
  handler: (e: KeyboardEvent) => void;
  modifierKey?: ModifierKey;
}

export function useKeyboardShortcut({
  condition,
  handler,
  modifierKey,
}: KeyboardShortcutConfig) {
  const shouldListen = useMemo(
    () => condition?.() || condition === undefined,
    [condition],
  );

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
      handler(e);
    },
    [handler, systemSpecificModifierKey],
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
    if (shouldListen) {
      addHandler();
    } else {
      removeHandler();
    }
    return () => removeHandler();
  }, [addHandler, removeHandler, shouldListen]);
}
