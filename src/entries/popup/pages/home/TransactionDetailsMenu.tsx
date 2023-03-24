import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentSheetStore } from '~/core/state/currentSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { goToNewTab } from '~/core/utils/tabs';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../components/ContextMenu/ContextMenu';
import { useToast } from '../../hooks/useToast';

export function TransactionDetailsMenu({
  children,
  transaction,
}: {
  children: ReactNode;
  transaction: RainbowTransaction;
}) {
  const { sheet, setCurrentSheet } = useCurrentSheetStore();
  const { setSelectedTransaction } = useSelectedTransactionStore();
  // need to control this manually so that menu closes when sheet appears
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);

  const { triggerToast } = useToast();
  const trimmedHash = useMemo(
    () => transaction?.hash?.replace(/-.*/g, '') || '',
    [transaction],
  );
  const truncatedAddress = useMemo(
    () => truncateAddress(trimmedHash as Address),
    [trimmedHash],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(trimmedHash);
    triggerToast({
      title: i18n.t('speed_up_and_cancel.handle_copy_title'),
      description: truncatedAddress,
    });
  }, [triggerToast, trimmedHash, truncatedAddress]);

  const viewOnExplorer = useCallback(() => {
    const explorer = getTransactionBlockExplorerUrl({
      chainId: transaction?.chainId || ChainId.mainnet,
      hash: trimmedHash,
    });
    goToNewTab({
      url: explorer,
    });
  }, [transaction?.chainId, trimmedHash]);

  const onValueChange = useCallback(
    (value: 'copy' | 'view' | 'speedUp' | 'cancel') => {
      switch (value) {
        case 'view':
          viewOnExplorer();
          break;
        case 'copy':
          handleCopy();
          break;
        case 'speedUp':
        case 'cancel':
          setCurrentSheet(value);
          setClosed(true);
          break;
      }
    },
    [handleCopy, setCurrentSheet, viewOnExplorer],
  );

  const onTrigger = useCallback(
    () => setSelectedTransaction(transaction),
    [transaction, setSelectedTransaction],
  );

  useEffect(() => {
    if (sheet !== 'none') {
      setClosed(true);
    }
  }, [sheet]);

  return (
    <MenuWrapper closed={closed} onOpenChange={onOpenChange}>
      <ContextMenuTrigger asChild onTrigger={onTrigger}>
        <Box position="relative">{children}</Box>
      </ContextMenuTrigger>
      <MenuContentWrapper closed={closed}>
        <ContextMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as 'copy' | 'view' | 'speedUp' | 'cancel')
          }
        >
          {transaction?.pending && (
            <>
              <ContextMenuRadioItem value={'speedUp'}>
                <MenuRow>
                  <Inline space="8px" alignVertical="center">
                    <Text weight="semibold" size="14pt">
                      {'🚀'}
                    </Text>
                    <Text color="label" size="14pt" weight="semibold">
                      {i18n.t('speed_up_and_cancel.speed_up')}
                    </Text>
                  </Inline>
                  <Box
                    background={'fillSecondary'}
                    padding="4px"
                    borderRadius="3px"
                    boxShadow="1px"
                  >
                    <Text size="12pt" color="labelSecondary" weight="semibold">
                      {shortcuts.activity.SPEED_UP_TRANSACTION.display}
                    </Text>
                  </Box>
                </MenuRow>
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value={'cancel'}>
                <MenuRow>
                  <Inline space="8px" alignVertical="center">
                    <Text weight="semibold" size="14pt">
                      {'☠️'}
                    </Text>
                    <Text size="14pt" weight="semibold">
                      {i18n.t('speed_up_and_cancel.cancel')}
                    </Text>
                  </Inline>
                  <Box
                    background={'fillSecondary'}
                    padding="4px"
                    borderRadius="3px"
                    boxShadow="1px"
                  >
                    <Text size="12pt" color="labelSecondary" weight="semibold">
                      {shortcuts.activity.CANCEL_TRANSACTION.display}
                    </Text>
                  </Box>
                </MenuRow>
              </ContextMenuRadioItem>
              <Box paddingVertical="4px">
                <ContextMenuSeparator />
              </Box>
            </>
          )}
          <ContextMenuRadioItem value="view">
            <MenuRow>
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
              <Symbol
                weight="medium"
                size={12}
                symbol="arrow.up.forward.circle"
                color="labelQuaternary"
              />
            </MenuRow>
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="copy">
            <MenuRow>
              <Inline space="8px" alignVertical="center">
                <Symbol
                  weight="medium"
                  size={18}
                  symbol="doc.on.doc.fill"
                  color="label"
                />
                <Stack space="8px">
                  <Text color="label" size="14pt" weight="semibold">
                    {i18n.t('speed_up_and_cancel.copy_tx_hash')}
                  </Text>
                  <Text color="labelSecondary" size="12pt" weight="semibold">
                    {truncateAddress(trimmedHash as Address)}
                  </Text>
                </Stack>
              </Inline>
            </MenuRow>
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </MenuContentWrapper>
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

function MenuContentWrapper({
  children,
  closed,
}: {
  children: ReactNode;
  closed: boolean;
}) {
  if (closed) return null;
  return <ContextMenuContent>{children}</ContextMenuContent>;
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
