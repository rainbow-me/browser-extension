import { ReactNode } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedUserAsset } from '~/core/types/assets';
import { truncateAddress } from '~/core/utils/address';
import { isNativeAsset } from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorer } from '~/core/utils/transactions';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';

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

  const onOpenChange = (open: boolean) => {
    if (open) setSelectedToken(token);
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
    setSelectedToken(token);
    navigate(ROUTES.SEND);
  };

  const onBridge = () => {
    setSelectedToken(token);
    navigate(ROUTES.BRIDGE);
  };

  const isBridgeable = token.bridging?.isBridgeable;

  const explorer = getTokenBlockExplorer(token);
  const hasExplorerLink = !isNativeAsset(token?.address, token?.chainId);
  const isEth = [token.address, token.mainnetAddress].includes(ETH_ADDRESS);

  if (isWatchingWallet && !allowSwap && isEth) return <>{children}</>;

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
        {isBridgeable && (
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
        {hasExplorerLink && (
          <ContextMenuItem
            symbolLeft="binoculars.fill"
            onSelect={() => goToNewTab(explorer)}
          >
            {i18n.t('token_details.view_on', { explorer: explorer.name })}
          </ContextMenuItem>
        )}
        {!isEth && (
          <ContextMenuItem
            symbolLeft="doc.on.doc.fill"
            onSelect={() => {
              navigator.clipboard.writeText(token.address);
              triggerToast({
                title: i18n.t('wallet_header.copy_toast'),
                description: truncateAddress(token.address),
              });
            }}
            shortcut={shortcuts.home.COPY_ADDRESS.display}
          >
            {i18n.t('token_details.more_options.copy_address')}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
