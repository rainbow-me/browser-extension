import React, { ReactNode, useState } from 'react';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Symbol, Text } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
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
      <DropdownMenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup>
          {transaction?.pending && (
            <>
              <DropdownMenuRadioItem value={'speedUp'}>
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
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={'cancel'}>
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
              </DropdownMenuRadioItem>
              <Box paddingVertical="4px">
                <DropdownMenuSeparator />
              </Box>
            </>
          )}
          <DropdownMenuRadioItem value={'blockExplorer'}>
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
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
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
    return (
      <DropdownMenu open={false} onOpenChange={onOpenChange}>
        {children}
      </DropdownMenu>
    );
  }

  return <DropdownMenu>{children}</DropdownMenu>;
}
