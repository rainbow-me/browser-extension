import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

interface TokenMenuShortcutListenerProps {
  togglePin: () => void;
  hideToken: () => void;
  copyTokenAddress: () => void;
}

export function TokenMenuShortcutListener({
  togglePin,
  hideToken,
  copyTokenAddress,
}: TokenMenuShortcutListenerProps) {
  const { trackShortcut } = useKeyboardAnalytics();

  const condition = useCallback(() => true, []);

  const handleContextMenuShortcuts = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case shortcuts.tokens.PIN_ASSET.key:
          trackShortcut({
            key: shortcuts.tokens.PIN_ASSET.display,
            type: 'tokenDetailsMenu.pin',
          });
          togglePin();
          break;
        case shortcuts.tokens.HIDE_ASSET.key:
          trackShortcut({
            key: shortcuts.tokens.HIDE_ASSET.display,
            type: 'tokenDetailsMenu.hide',
          });
          hideToken();
          break;
        case shortcuts.home.COPY_ADDRESS.key:
          trackShortcut({
            key: shortcuts.home.COPY_ADDRESS.display,
            type: 'tokenDetailsMenu.copyTokenAddress',
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
