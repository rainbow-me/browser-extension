import { useCallback, useEffect, useMemo } from 'react';

export function useKeyboardShortcut({
  condition,
  handler,
}: {
  condition?: () => boolean;
  handler: (e: KeyboardEvent) => void;
}) {
  const shouldListen = useMemo(
    () => condition?.() || condition === undefined,
    [condition],
  );
  const addHandler = useCallback(
    () => document.addEventListener('keydown', handler),
    [handler],
  );
  const removeHandler = useCallback(
    () => document.removeEventListener('keydown', handler),
    [handler],
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
