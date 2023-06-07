import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Symbol, Text } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/util';

import {
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
} from '../../components/ContextMenu/ContextMenu';
import {
  DetailsMenuContentWrapper,
  DetailsMenuRow,
  DetailsMenuWrapper,
} from '../../components/DetailsMenu';
import { useNavigateToSwaps } from '../../hooks/useNavigateToSwaps';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';

type TokenDetailsMenuOption = 'swap' | 'send' | 'view';
interface TokenDetailsMenuProps {
  children: ReactNode;
  token: ParsedAddressAsset;
}

export function TokenDetailsMenu({ children, token }: TokenDetailsMenuProps) {
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);
  const navigateToSwaps = useNavigateToSwaps();

  const { isWatchingWallet } = useWallets();
  const { featureFlags } = useFeatureFlagsStore();
  const { selectedToken, setSelectedToken } = useSelectedTokenStore();

  const navigate = useRainbowNavigate();

  const viewOnExplorer = useCallback(() => {
    const explorer = getTokenBlockExplorerUrl({
      chainId: token?.chainId || ChainId.mainnet,
      address: token?.address,
    });
    goToNewTab({
      url: explorer,
    });
  }, [token]);

  const allowSwap = useMemo(
    () =>
      (!isWatchingWallet || featureFlags.full_watching_wallets) &&
      config.swaps_enabled,
    [featureFlags.full_watching_wallets, isWatchingWallet],
  );

  const goToSwap = useCallback(() => {
    if (allowSwap) {
      navigateToSwaps();
    } else {
      triggerAlert({ text: i18n.t('alert.coming_soon') });
      // clear selected token
      setSelectedToken();
    }
  }, [allowSwap, navigateToSwaps, setSelectedToken]);

  const onValueChange = useCallback(
    (value: TokenDetailsMenuOption) => {
      switch (value) {
        case 'view':
          viewOnExplorer();
          break;
        case 'send':
          setSelectedToken(token);
          navigate(ROUTES.SEND);
          setClosed(true);
          break;
        case 'swap':
          setSelectedToken(token);
          goToSwap();
          setClosed(true);
          break;
      }
    },
    [goToSwap, navigate, setSelectedToken, token, viewOnExplorer],
  );

  useEffect(() => {
    if (!selectedToken) {
      setClosed(true);
    }
  }, [selectedToken, setClosed]);

  const hasExplorerLink = !isNativeAsset(token?.address, token?.chainId);

  if (!hasExplorerLink && isWatchingWallet) return children;

  return (
    <DetailsMenuWrapper closed={closed} onOpenChange={onOpenChange}>
      <ContextMenuTrigger>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <DetailsMenuContentWrapper closed={closed}>
        <ContextMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as TokenDetailsMenuOption)
          }
        >
          {allowSwap && (
            <ContextMenuRadioItem value={'swap'}>
              <DetailsMenuRow>
                <Inline space="8px" alignVertical="center">
                  <Symbol
                    weight="medium"
                    size={18}
                    symbol="arrow.triangle.swap"
                    color="label"
                  />
                  <Text color="label" size="14pt" weight="semibold">
                    {`${i18n.t('asset_details_menu.swap')} ${token.symbol}`}
                  </Text>
                </Inline>
                <Box
                  background={'fillSecondary'}
                  padding="4px"
                  borderRadius="3px"
                  boxShadow="1px"
                >
                  <Text size="12pt" color="labelSecondary" weight="semibold">
                    {shortcuts.tokens.SWAP_ASSET.display}
                  </Text>
                </Box>
              </DetailsMenuRow>
            </ContextMenuRadioItem>
          )}
          {!isWatchingWallet && (
            <ContextMenuRadioItem value={'send'}>
              <DetailsMenuRow>
                <Inline space="8px" alignVertical="center">
                  <Symbol
                    weight="medium"
                    size={18}
                    symbol="paperplane.fill"
                    color="label"
                  />
                  <Text size="14pt" weight="semibold">
                    {`${i18n.t('asset_details_menu.send')} ${token.symbol}`}
                  </Text>
                </Inline>
                <Box
                  background={'fillSecondary'}
                  padding="4px"
                  borderRadius="3px"
                  boxShadow="1px"
                >
                  <Text size="12pt" color="labelSecondary" weight="semibold">
                    {shortcuts.tokens.SEND_ASSET.display}
                  </Text>
                </Box>
              </DetailsMenuRow>
            </ContextMenuRadioItem>
          )}
          {hasExplorerLink && (
            <ContextMenuRadioItem value="view">
              <DetailsMenuRow>
                <Inline space="8px" alignVertical="center">
                  <Symbol
                    weight="medium"
                    size={18}
                    symbol="binoculars.fill"
                    color="label"
                  />
                  <Text color="label" size="14pt" weight="semibold">
                    {token?.chainId === ChainId.mainnet
                      ? i18n.t('asset_details_menu.view_on_etherscan')
                      : i18n.t('asset_details_menu.view_on_explorer')}
                  </Text>
                </Inline>
                <Box
                  background={'fillSecondary'}
                  padding="4px"
                  borderRadius="3px"
                  boxShadow="1px"
                >
                  <Text size="12pt" color="labelSecondary" weight="semibold">
                    {shortcuts.tokens.VIEW_ASSET.display}
                  </Text>
                </Box>
              </DetailsMenuRow>
            </ContextMenuRadioItem>
          )}
        </ContextMenuRadioGroup>
      </DetailsMenuContentWrapper>
    </DetailsMenuWrapper>
  );
}
