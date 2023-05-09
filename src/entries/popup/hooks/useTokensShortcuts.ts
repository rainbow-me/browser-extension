import { useCallback, useMemo } from 'react';
import { Address } from 'wagmi';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ChainId } from '~/core/types/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorerUrl } from '~/core/utils/transactions';

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
      config.swaps_enabled,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const viewOnExplorer = useCallback(() => {
    const explorer = getTokenBlockExplorerUrl({
      chainId: selectedToken?.chainId || ChainId.mainnet,
      address: selectedToken?.address || ('' as Address),
    });
    goToNewTab({
      url: explorer,
    });
  }, [selectedToken]);

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
        }
        if (e.key === shortcuts.tokens.SEND_ASSET.key) {
          navigate(ROUTES.SEND);
        }
        if (e.key === shortcuts.tokens.VIEW_ASSET.key) {
          viewOnExplorer();
        }
      }
    },
    [
      allowSwap,
      navigate,
      selectedToken,
      setSelectedToken,
      triggerAlert,
      viewOnExplorer,
    ],
  );
  useKeyboardShortcut({
    condition: () => !!selectedToken,
    handler: handleTokenShortcuts,
  });
}
