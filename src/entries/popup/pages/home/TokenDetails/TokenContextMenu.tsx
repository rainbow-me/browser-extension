import { ReactNode, useCallback } from 'react';

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
import { truncateAddress } from '~/core/utils/address';
import { isNativeAsset } from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import { Text, TextOverflow } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { simulateClick } from '~/entries/popup/utils/simulateClick';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../../components/ContextMenu/ContextMenu';
import { DetailsMenuWrapper } from '../../../components/DetailsMenu';
import { useNavigateToSwaps } from '../../../hooks/useNavigateToSwaps';
import { useRainbowNavigate } from '../../../hooks/useRainbowNavigate';
import { useWallets } from '../../../hooks/useWallets';
import { ROUTES } from '../../../urls';

interface TokenContextMenuProps {
  children: ReactNode;
  token: ParsedUserAsset;
}

export function TokenContextMenu({ children, token }: TokenContextMenuProps) {
  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const { currentAddress: address } = useCurrentAddressStore();
  const { pinned: pinnedStore, togglePinAsset } = usePinnedAssetStore();
  const setSelectedToken = useSelectedTokenStore.use.setSelectedToken();
  const toggleHideAsset = useHiddenAssetStore.use.toggleHideAsset();
  const pinned = !!pinnedStore[address]?.[token.uniqueId]?.pinned;

  // if we are navigating to new page (swap/send) the menu closes automatically,
  // we don't want deselect the token in that case
  let isNavigating = false;
  const onOpenChange = (open: boolean) => {
    setSelectedToken(open || isNavigating ? token : undefined);
  };

  const navigate = useRainbowNavigate();
  const navigateToSwaps = useNavigateToSwaps();

  const allowSwap =
    (!isWatchingWallet || featureFlags.full_watching_wallets) &&
    config.swaps_enabled;

  const isBridgeable = token.bridging?.isBridgeable;

  const explorer = getTokenBlockExplorer(token);
  const isNative = isNativeAsset(token?.address, token?.chainId);
  const containerRef = useContainerRef();

  const onSwap = () => {
    setSelectedToken(token);
    if (allowSwap) {
      isNavigating = true;
      navigateToSwaps();
    } else {
      triggerAlert({ text: i18n.t('alert.coming_soon') });
      setSelectedToken(); // clear selected token
    }
  };

  const onSend = () => {
    isNavigating = true;
    navigate(ROUTES.SEND);
  };

  const onBridge = () => {
    isNavigating = true;
    navigate(ROUTES.BRIDGE);
  };

  const togglePinToken = useCallback(() => {
    simulateClick(containerRef.current);
    togglePinAsset(address, token.uniqueId);
    if (pinned) {
      triggerToast({
        title: i18n.t('token_details.toast.unpin_token', {
          name: token.symbol,
        }),
      });
      return;
    }
    triggerToast({
      title: i18n.t('token_details.toast.pin_token', {
        name: token.symbol,
      }),
    });
  }, [
    token.uniqueId,
    token.symbol,
    pinned,
    containerRef,
    togglePinAsset,
    address,
  ]);

  const hideToken = useCallback(() => {
    simulateClick(containerRef.current);
    toggleHideAsset(address, computeUniqueIdForHiddenAsset(token));
    if (pinned) togglePinAsset(address, token.uniqueId);
    setSelectedToken();
    triggerToast({
      title: i18n.t('token_details.toast.hide_token', {
        name: token.symbol,
      }),
    });
  }, [
    token,
    containerRef,
    address,
    pinned,
    toggleHideAsset,
    togglePinAsset,
    setSelectedToken,
  ]);

  const copyTokenAddress = useCallback(() => {
    if (isNative) return;
    copyAddress(token.address);
  }, [token.address, isNative]);

  if (isWatchingWallet && !allowSwap && isNative) return <>{children}</>;

  return (
    <DetailsMenuWrapper closed={true} onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {allowSwap && (
          <ContextMenuItem
            symbolLeft="arrow.triangle.swap"
            onSelect={onSwap}
            shortcut={shortcuts.home.GO_TO_SWAP.display}
          >
            {`${i18n.t('token_details.swap')} ${token.symbol}`}
          </ContextMenuItem>
        )}
        {!isWatchingWallet && isBridgeable && (
          <ContextMenuItem
            symbolLeft="arrow.turn.up.right"
            onSelect={onBridge}
            shortcut={shortcuts.tokens.BRIDGE_ASSET.display}
          >
            {`${i18n.t('token_details.bridge')} ${token.symbol}`}
          </ContextMenuItem>
        )}
        {!isWatchingWallet && (
          <ContextMenuItem
            symbolLeft="paperplane.fill"
            onSelect={onSend}
            shortcut={shortcuts.home.GO_TO_SEND.display}
          >
            {`${i18n.t('token_details.send')} ${token.symbol}`}
          </ContextMenuItem>
        )}
        <ContextMenuItem
          symbolLeft="pin.fill"
          onSelect={togglePinToken}
          shortcut={shortcuts.tokens.PIN_ASSET.display}
        >
          <TextOverflow
            size="14pt"
            weight="semibold"
            color="label"
            testId="account-name"
          >
            {pinned
              ? i18n.t('token_details.more_options.unpin_token', {
                  name: token.symbol,
                })
              : i18n.t('token_details.more_options.pin_token', {
                  name: token.symbol,
                })}
          </TextOverflow>
        </ContextMenuItem>
        {!isWatchingWallet && (
          <ContextMenuItem
            symbolLeft="eye.slash.fill"
            onSelect={hideToken}
            shortcut={shortcuts.tokens.HIDE_ASSET.display}
          >
            <TextOverflow size="14pt" weight="semibold" color="label">
              {i18n.t('token_details.more_options.hide_token', {
                name: token.symbol,
              })}
            </TextOverflow>
          </ContextMenuItem>
        )}
        {!isNative && (
          <ContextMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={copyTokenAddress}
            shortcut={shortcuts.home.COPY_ADDRESS.display}
          >
            <Text size="14pt" weight="semibold">
              {i18n.t('token_details.more_options.copy_address')}
            </Text>
            <Text size="11pt" color="labelTertiary" weight="medium">
              {truncateAddress(token.address)}
            </Text>
          </ContextMenuItem>
        )}
        {explorer && <ContextMenuSeparator />}
        {explorer && (
          <ContextMenuItem
            symbolLeft="binoculars.fill"
            onSelect={() => goToNewTab(explorer)}
            external
          >
            {i18n.t('token_details.view_on', { explorer: explorer.name })}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
