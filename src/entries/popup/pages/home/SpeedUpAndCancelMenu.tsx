import React, { ReactNode, useState } from 'react';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Symbol, Text } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { SpeedUpAndCancelSheetPrompt } from '../speedUpAndCancelSheet';

export function SpeedUpAndCancelMenu({
  children,
  onRowSelection,
  transaction,
}: {
  children: ReactNode;
  onRowSelection: ({
    prompt,
    transaction,
  }: {
    prompt: SpeedUpAndCancelSheetPrompt;
    transaction: RainbowTransaction;
  }) => void;
  transaction: RainbowTransaction;
}) {
  // need to control this manually so that menu closes when modal appears
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);
  return (
    <MenuWrapper closed={closed} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Box position="relative">{children}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <MenuRow>
          <Box
            onClick={() => {
              onRowSelection({ prompt: 'speedUp', transaction });
              setClosed(true);
            }}
          >
            <Inline space="8px" alignVertical="center">
              <Text weight="semibold" size="14pt">
                {'🚀'}
              </Text>
              <Text color="label" size="14pt" weight="semibold">
                {i18n.t('speed_up_and_cancel.speed_up')}
              </Text>
            </Inline>
          </Box>
        </MenuRow>
        <MenuRow>
          <Box
            onClick={() => {
              onRowSelection({ prompt: 'cancel', transaction });
              setClosed(true);
            }}
          >
            <Inline space="8px" alignVertical="center">
              <Text weight="semibold" size="14pt">
                {'☠️'}
              </Text>
              <Text size="14pt" weight="semibold">
                {i18n.t('speed_up_and_cancel.cancel')}
              </Text>
            </Inline>
          </Box>
        </MenuRow>
        <Box paddingVertical="4px">
          <DropdownMenuSeparator />
        </Box>
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
                {i18n.t('speed_up_and_cancel.view_on_etherscan')}
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
      </DropdownMenuContent>
    </MenuWrapper>
  );
}

function MenuRow({ children }: { children: ReactNode }) {
  return (
    <Box paddingVertical="12px">
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
