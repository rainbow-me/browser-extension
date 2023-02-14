import React, { ReactNode, useState } from 'react';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Symbol, Text } from '~/design-system';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../components/ContextMenu/ContextMenu';
import { SheetMode } from '../speedUpAndCancelSheet';

export function TransactionDetailsMenu({
  children,
  onRowSelection,
  transaction,
}: {
  children: ReactNode;
  onRowSelection: ({
    sheet,
    transaction,
  }: {
    sheet: SheetMode;
    transaction: RainbowTransaction;
  }) => void;
  transaction: RainbowTransaction;
}) {
  // need to control this manually so that menu closes when sheet appears
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);
  const handleRowSelection = (sheet: SheetMode) => () => {
    onRowSelection({ sheet, transaction });
    setClosed(true);
  };
  return (
    <MenuWrapper closed={closed} onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuRadioGroup>
          {transaction?.pending && (
            <>
              <ContextMenuRadioItem value={'speedUp'}>
                <MenuRow onClick={handleRowSelection('speedUp')}>
                  <Inline space="8px" alignVertical="center">
                    <Text weight="semibold" size="14pt">
                      {'🚀'}
                    </Text>
                    <Text color="label" size="14pt" weight="semibold">
                      {i18n.t('speed_up_and_cancel.speed_up')}
                    </Text>
                  </Inline>
                </MenuRow>
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value={'cancel'}>
                <MenuRow onClick={handleRowSelection('cancel')}>
                  <Inline space="8px" alignVertical="center">
                    <Text weight="semibold" size="14pt">
                      {'☠️'}
                    </Text>
                    <Text size="14pt" weight="semibold">
                      {i18n.t('speed_up_and_cancel.cancel')}
                    </Text>
                  </Inline>
                </MenuRow>
              </ContextMenuRadioItem>
              <Box paddingVertical="4px">
                <ContextMenuSeparator />
              </Box>
            </>
          )}
          <ContextMenuRadioItem value={'blockExplorer'}>
            <MenuRow>
              <a
                href={getTransactionBlockExplorerUrl({
                  chainId: transaction?.chainId || ChainId.mainnet,
                  hash: transaction?.hash || '',
                })}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'inherit' }}
              >
                <Inline space="8px" alignVertical="center">
                  <Symbol
                    weight="medium"
                    size={18}
                    symbol="binoculars.fill"
                    color="label"
                  />
                  <Text color="label" size="14pt" weight="semibold">
                    {transaction?.chainId === ChainId.mainnet
                      ? i18n.t('speed_up_and_cancel.view_on_etherscan')
                      : i18n.t('speed_up_and_cancel.view_on_explorer')}
                  </Text>
                </Inline>
              </a>
              <Symbol
                weight="medium"
                size={12}
                symbol="arrow.up.forward.circle"
                color="labelQuaternary"
              />
            </MenuRow>
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </MenuWrapper>
  );
}

function MenuRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Box onClick={onClick} paddingVertical="2px" width="full">
      <Inline space="8px" alignVertical="center" alignHorizontal="justify">
        {children}
      </Inline>
    </Box>
  );
}

function MenuWrapper({
  children,
  closed,
  onOpenChange,
}: {
  children: ReactNode;
  closed: boolean;
  onOpenChange: () => void;
}) {
  if (closed) {
    return <ContextMenu onOpenChange={onOpenChange}>{children}</ContextMenu>;
  }

  return <ContextMenu>{children}</ContextMenu>;
}
