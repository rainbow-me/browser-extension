import { ReactNode } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { isNativeAsset } from '~/core/utils/chains';
import { copyAddress } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import { Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';

import {
  ContextMenuContent,
  ContextMenuItem,
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
  const setSelectedToken = useSelectedTokenStore((s) => s.setSelectedToken);

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

  const onSwap = () => {
    setSelectedToken(token);
    if (allowSwap) navigateToSwaps();
    else {
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

  const isBridgeable = token.bridging?.isBridgeable;

  const explorer = getTokenBlockExplorer(token);
  const isNative = isNativeAsset(token?.address, token?.chainId);

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
        {explorer && (
          <ContextMenuItem
            symbolLeft="binoculars.fill"
            onSelect={() => goToNewTab(explorer)}
          >
            {i18n.t('token_details.view_on', { explorer: explorer.name })}
          </ContextMenuItem>
        )}
        {!isNative && (
          <ContextMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => copyAddress(token.address)}
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
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
