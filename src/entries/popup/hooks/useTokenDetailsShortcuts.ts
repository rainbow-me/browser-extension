import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { simulateClick } from '../utils/simulateClick';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useWallets } from './useWallets';

interface UseTokenDetailsShortcutsParameters {
  getTokenExists: () => boolean;
  toggleHideToken: () => void;
  togglePinToken: () => void;
  copyTokenAddress: () => void;
  unownedToken: boolean;
}

export function useTokenDetailsShortcuts({
  getTokenExists,
  togglePinToken,
  toggleHideToken,
  copyTokenAddress,
  unownedToken,
}: UseTokenDetailsShortcutsParameters) {
  const { trackShortcut } = useKeyboardAnalytics();
  const { isWatchingWallet } = useWallets();
  const containerRef = useContainerRef();

  const handleTokenShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.tokens.PIN_ASSET.key && !unownedToken) {
        simulateClick(containerRef.current);
        trackShortcut({
          key: shortcuts.tokens.PIN_ASSET.display,
          type: 'tokenDetailsMenu.pin',
        });
        togglePinToken();
      }
      if (
        e.key === shortcuts.tokens.HIDE_ASSET.key &&
        !isWatchingWallet &&
        !unownedToken
      ) {
        simulateClick(containerRef.current);
        trackShortcut({
          key: shortcuts.tokens.HIDE_ASSET.display,
          type: 'tokenDetailsMenu.hide',
        });
        toggleHideToken();
      }
      if (e.key === shortcuts.home.COPY_ADDRESS.key) {
        simulateClick(containerRef.current);
        trackShortcut({
          key: shortcuts.home.COPY_ADDRESS.display,
          type: 'tokenDetailsMenu.copyTokenAddress',
        });
        copyTokenAddress();
      }
    },
    [
      unownedToken,
      isWatchingWallet,
      containerRef,
      trackShortcut,
      togglePinToken,
      toggleHideToken,
      copyTokenAddress,
    ],
  );

  useKeyboardShortcut({
    condition: getTokenExists,
    handler: handleTokenShortcuts,
  });
}
