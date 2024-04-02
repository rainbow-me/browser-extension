import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { simulateClick } from '../utils/simulateClick';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';

interface UseTokenDetailsShortcutsParameters {
  getTokenExist: () => boolean;
  toggleHideToken: () => void;
  togglePinToken: () => void;
  copyTokenAddress: () => void;
}

export function useTokenDetailsShortcuts({
  getTokenExist,
  togglePinToken,
  toggleHideToken,
  copyTokenAddress,
}: UseTokenDetailsShortcutsParameters) {
  const { trackShortcut } = useKeyboardAnalytics();

  const containerRef = useContainerRef();

  const handleTokenShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.tokens.PIN_ASSET.key) {
        simulateClick(containerRef.current);
        trackShortcut({
          key: shortcuts.tokens.PIN_ASSET.display,
          type: 'tokenDetailsMenu.pin',
        });
        togglePinToken();
      }
      if (e.key === shortcuts.tokens.HIDE_ASSET.key) {
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
      containerRef,
      trackShortcut,
      togglePinToken,
      toggleHideToken,
      copyTokenAddress,
    ],
  );

  useKeyboardShortcut({
    condition: getTokenExist,
    handler: handleTokenShortcuts,
  });
}
