import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useSelectedTokenStore } from '~/core/state/selectedToken';

import { ROUTES } from '../urls';

import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useRainbowNavigate } from './useRainbowNavigate';

export function useTokensShortcuts() {
  const { selectedToken } = useSelectedTokenStore();
  const navigate = useRainbowNavigate();
  const handleTokenShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (selectedToken) {
        if (e.key === shortcuts.tokens.SWAP_ASSET.key) {
          navigate(ROUTES.SWAP);
        } else if (e.key === shortcuts.tokens.SEND_ASSET.key) {
          navigate(ROUTES.SEND);
        }
      }
    },
    [navigate, selectedToken],
  );
  useKeyboardShortcut({
    condition: () => !!selectedToken,
    handler: handleTokenShortcuts,
  });
}
