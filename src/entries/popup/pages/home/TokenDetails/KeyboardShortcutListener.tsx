import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

interface KeyboardShortcutListenerProps {
  togglePin: () => void;
  hideToken: () => void;
  copyTokenAddress: () => void;
}

export function KeyboardShortcutListener({
  togglePin,
  hideToken,
  copyTokenAddress,
}: KeyboardShortcutListenerProps) {
  const { trackShortcut } = useKeyboardAnalytics();

  const condition = useCallback(() => true, []);

  const handleContextMenuShortcuts = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case shortcuts.tokens.PIN_ASSET.key:
          trackShortcut({
            key: shortcuts.tokens.PIN_ASSET.display,
            type: 'tokens.pin',
          });
          togglePin();
          break;
        case shortcuts.tokens.HIDE_ASSET.key:
          trackShortcut({
            key: shortcuts.tokens.HIDE_ASSET.display,
            type: 'tokens.hide',
          });
          hideToken();
          break;
        case shortcuts.home.COPY_ADDRESS.key:
          trackShortcut({
            key: shortcuts.home.COPY_ADDRESS.display,
            type: 'tokens.copyTokenAddress',
          });
          copyTokenAddress();
          break;
      }
    },
    [copyTokenAddress, hideToken, togglePin, trackShortcut],
  );

  useKeyboardShortcut({
    condition,
    handler: handleContextMenuShortcuts,
  });

  return <></>;
}
