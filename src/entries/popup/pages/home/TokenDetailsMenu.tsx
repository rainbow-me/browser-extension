import React, { ReactNode, useCallback, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { goToNewTab } from '~/core/utils/tabs';
import { getTokenBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Symbol, Text } from '~/design-system';

import {
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../components/ContextMenu/ContextMenu';
import {
  DetailsMenuContentWrapper,
  DetailsMenuRow,
  DetailsMenuWrapper,
} from '../../components/DetailsMenu';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

type TokenDetailsMenuOption = 'swap' | 'send' | 'view';
interface TokenDetailsMenuProps {
  children: ReactNode;
  token: ParsedAddressAsset;
}

export function TokenDetailsMenu({ children, token }: TokenDetailsMenuProps) {
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);
  const { setSelectedToken } = useSelectedTokenStore();

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

  const onValueChange = useCallback(
    (value: TokenDetailsMenuOption) => {
      switch (value) {
        case 'view':
          viewOnExplorer();
          break;
        case 'send':
          navigate(ROUTES.SEND);
          setClosed(true);
          break;
        case 'swap':
          navigate(ROUTES.SWAP);
          setClosed(true);
          break;
      }
    },
    [navigate, viewOnExplorer],
  );

  const onTrigger = useCallback(
    () => setSelectedToken(token),
    [setSelectedToken, token],
  );

  return (
    <DetailsMenuWrapper closed={closed} onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild onTrigger={onTrigger}>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <DetailsMenuContentWrapper closed={closed}>
        <ContextMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as TokenDetailsMenuOption)
          }
        >
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
          {!isNativeAsset(token?.address, token?.chainId) && (
            <>
              <Box paddingVertical="4px">
                <ContextMenuSeparator />
              </Box>
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
                  <Symbol
                    weight="medium"
                    size={12}
                    symbol="arrow.up.forward.circle"
                    color="labelQuaternary"
                  />
                </DetailsMenuRow>
              </ContextMenuRadioItem>
            </>
          )}
        </ContextMenuRadioGroup>
      </DetailsMenuContentWrapper>
    </DetailsMenuWrapper>
  );
}
