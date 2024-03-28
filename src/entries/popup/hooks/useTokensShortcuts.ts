import { useCallback, useMemo } from 'react';
import { type Address } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorerUrl } from '~/core/utils/transactions';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import { ROUTES } from '../urls';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useNavigateToSwaps } from './useNavigateToSwaps';
import { useRainbowNavigate } from './useRainbowNavigate';
import { useWallets } from './useWallets';

export function useTokensShortcuts() {
  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const { selectedToken, setSelectedToken } = useSelectedTokenStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const navigate = useRainbowNavigate();
  const navigateToSwaps = useNavigateToSwaps();

  const hasExplorerLink =
    selectedToken &&
    !isNativeAsset(selectedToken?.address, selectedToken?.chainId);

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
            trackShortcut({
              key: shortcuts.tokens.SWAP_ASSET.display,
              type: 'tokens.goToSwap',
            });
            navigateToSwaps();
          } else {
            triggerAlert({ text: i18n.t('alert.coming_soon') });
            // clear selected token
            setSelectedToken();
          }
        }
        if (e.key === shortcuts.tokens.BRIDGE_ASSET.key) {
          trackShortcut({
            key: shortcuts.tokens.BRIDGE_ASSET.display,
            type: 'tokens.goToBridge',
          });
          navigate(ROUTES.BRIDGE);
        }

        if (e.key === shortcuts.tokens.SEND_ASSET.key) {
          trackShortcut({
            key: shortcuts.tokens.SEND_ASSET.display,
            type: 'tokens.goToSend',
          });
          navigate(ROUTES.SEND);
        }
        if (e.key === shortcuts.tokens.VIEW_ASSET.key) {
          trackShortcut({
            key: shortcuts.tokens.VIEW_ASSET.display,
            type: 'tokens.viewAssetOnExplorer',
          });
          hasExplorerLink && viewOnExplorer();
        }
      }
    },
    [
      allowSwap,
      hasExplorerLink,
      navigate,
      navigateToSwaps,
      selectedToken,
      setSelectedToken,
      trackShortcut,
      viewOnExplorer,
    ],
  );
  useKeyboardShortcut({
    condition: () => !!selectedToken,
    handler: handleTokenShortcuts,
  });
}
