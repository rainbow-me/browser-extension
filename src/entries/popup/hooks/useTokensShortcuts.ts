import { useCallback, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useSelectedTokenStore } from '~/core/state/selectedToken';

import { ROUTES } from '../urls';

import { useAlert } from './useAlert';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useRainbowNavigate } from './useRainbowNavigate';
import { useWallets } from './useWallets';

export function useTokensShortcuts() {
  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const { selectedToken, setSelectedToken } = useSelectedTokenStore();
  const { triggerAlert } = useAlert();
  const navigate = useRainbowNavigate();

  const allowSwap = useMemo(
    () =>
      (!isWatchingWallet || featureFlags.full_watching_wallets) &&
      featureFlags.swaps,
    [featureFlags.full_watching_wallets, featureFlags.swaps, isWatchingWallet],
  );

  const handleTokenShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (selectedToken) {
        if (e.key === shortcuts.tokens.SWAP_ASSET.key) {
          if (allowSwap) {
            navigate(ROUTES.SWAP);
          } else {
            triggerAlert({ text: i18n.t('alert.coming_soon') });
            // clear selected token
            setSelectedToken();
          }
        } else if (e.key === shortcuts.tokens.SEND_ASSET.key) {
          navigate(ROUTES.SEND);
        }
      }
    },
    [allowSwap, navigate, selectedToken, setSelectedToken, triggerAlert],
  );
  useKeyboardShortcut({
    condition: () => !!selectedToken,
    handler: handleTokenShortcuts,
  });
}
