import { useCallback } from 'react';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useSendShortcuts() {
  const handleTokenShortcuts = useCallback((e: KeyboardEvent) => {
    console.log('event: ', e);
  }, []);
  useKeyboardShortcut({
    condition: () => true,
    handler: handleTokenShortcuts,
  });
}
