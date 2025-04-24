import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Address } from 'viem';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { usePinnedAssetStore } from '~/core/state/pinnedAssets';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorerUrl } from '~/core/utils/transactions';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

import { triggerToast } from '../components/Toast/Toast';
import { ROUTES } from '../urls';
import { simulateClick } from '../utils/simulateClick';

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
  const { currentAddress: address } = useCurrentAddressStore();
  const navigate = useRainbowNavigate();
  const navigateToSwaps = useNavigateToSwaps();

  const containerRef = useContainerRef();

  const { pinned: pinnedStore, togglePinAsset } = usePinnedAssetStore();
  const toggleHideAsset = useHiddenAssetStore((state) => state.toggleHideAsset);
  const location = useLocation();
  const isHomeRoute = location.pathname === ROUTES.HOME;

  const hasExplorerLink =
    selectedToken &&
    !isNativeAsset(selectedToken?.address, selectedToken?.chainId);

  const pinned = selectedToken
    ? !!pinnedStore[address]?.[selectedToken.uniqueId]?.pinned
    : false;

  const allowSwap = useMemo(
    () =>
      (!isWatchingWallet || featureFlags.full_watching_wallets) &&
      config.swaps_enabled,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const hideToken = useCallback(
    (_selectedToken: ParsedUserAsset) => {
      simulateClick(containerRef.current);
      toggleHideAsset(address, computeUniqueIdForHiddenAsset(_selectedToken));
      if (pinned) togglePinAsset(address, _selectedToken.uniqueId);
      setSelectedToken();
      triggerToast({
        title: i18n.t('token_details.toast.hide_token', {
          name: _selectedToken.symbol,
        }),
      });
      const isHidden =
        useHiddenAssetStore.getState().hidden[address]?.[
          computeUniqueIdForHiddenAsset(_selectedToken)
        ];
      const hiddenCount = Object.values(
        useHiddenAssetStore.getState().hidden[address] || {},
      ).filter((isHidden) => isHidden).length;
      analytics.track(isHidden ? event.tokenHidden : event.tokenUnhidden, {
        token: {
          address: _selectedToken.address,
          chainId: _selectedToken.chainId,
        },
        hiddenTokens: hiddenCount,
      });
    },
    [
      containerRef,
      address,
      pinned,
      toggleHideAsset,
      togglePinAsset,
      setSelectedToken,
    ],
  );

  const togglePinToken = useCallback(
    (_selectedToken: ParsedUserAsset) => {
      simulateClick(containerRef.current);
      togglePinAsset(address, _selectedToken.uniqueId);
      if (pinned) {
        triggerToast({
          title: i18n.t('token_details.toast.unpin_token', {
            name: _selectedToken.symbol,
          }),
        });
        return;
      }
      triggerToast({
        title: i18n.t('token_details.toast.pin_token', {
          name: _selectedToken.symbol,
        }),
      });
    },
    [containerRef, address, togglePinAsset, pinned],
  );

  const copyTokenAddress = useCallback(
    (_selectedToken: ParsedUserAsset) => {
      const isNative = isNativeAsset(
        _selectedToken?.address,
        _selectedToken?.chainId,
      );
      if (isNative) return;
      copyAddress(_selectedToken.address);
      simulateClick(containerRef.current);
    },
    [containerRef],
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
      if (selectedToken && isHomeRoute) {
        if (e.key === shortcuts.tokens.SWAP_ASSET.key) {
          if (allowSwap) {
            navigateToSwaps();
            analytics.track(event.swapOpened, {
              entryPoint: 'token_details_shortcut_x_key',
            });
            trackShortcut({
              key: shortcuts.tokens.SWAP_ASSET.display,
              type: 'tokens.goToSwap',
            });
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

        if (e.key === shortcuts.tokens.SEND_ASSET.key && !isWatchingWallet) {
          navigate(ROUTES.SEND);
          analytics.track(event.sendOpened, {
            entryPoint: 'token_details_shortcut_x_key',
          });
          trackShortcut({
            key: shortcuts.tokens.SEND_ASSET.display,
            type: 'tokens.goToSend',
          });
        }
        if (e.key === shortcuts.tokens.VIEW_ASSET.key) {
          trackShortcut({
            key: shortcuts.tokens.VIEW_ASSET.display,
            type: 'tokens.viewAssetOnExplorer',
          });
          hasExplorerLink && viewOnExplorer();
        }
        if (e.key === shortcuts.tokens.PIN_ASSET.key) {
          trackShortcut({
            key: shortcuts.tokens.PIN_ASSET.display,
            type: 'tokenDetailsMenu.pin',
          });
          togglePinToken(selectedToken);
        }
        if (e.key === shortcuts.tokens.HIDE_ASSET.key && !isWatchingWallet) {
          trackShortcut({
            key: shortcuts.tokens.HIDE_ASSET.display,
            type: 'tokenDetailsMenu.hide',
          });
          hideToken(selectedToken);
        }
        if (e.key === shortcuts.home.COPY_ADDRESS.key) {
          trackShortcut({
            key: shortcuts.home.COPY_ADDRESS.display,
            type: 'tokenDetailsMenu.copyTokenAddress',
          });
          copyTokenAddress(selectedToken);
        }
      }
    },
    [
      selectedToken,
      isHomeRoute,
      isWatchingWallet,
      allowSwap,
      trackShortcut,
      navigateToSwaps,
      setSelectedToken,
      navigate,
      hasExplorerLink,
      viewOnExplorer,
      togglePinToken,
      hideToken,
      copyTokenAddress,
    ],
  );
  useKeyboardShortcut({
    condition: () => !!selectedToken && isHomeRoute,
    handler: handleTokenShortcuts,
  });
}
