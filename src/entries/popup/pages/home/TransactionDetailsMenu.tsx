import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { goToNewTab } from '~/core/utils/tabs';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Inline, Stack, Symbol, Text } from '~/design-system';

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
import { triggerToast } from '../../components/Toast/Toast';

export function TransactionDetailsMenu({
  children,
  transaction,
}: {
  children: ReactNode;
  transaction: RainbowTransaction;
}) {
  const { sheet, setCurrentHomeSheet } = useCurrentHomeSheetStore();
  const { setSelectedTransaction } = useSelectedTransactionStore();
  // need to control this manually so that menu closes when sheet appears
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);

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
  }, [trimmedHash, truncatedAddress]);

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
          setCurrentHomeSheet(value);
          setClosed(true);
          break;
      }
    },
    [handleCopy, setCurrentHomeSheet, viewOnExplorer],
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
    <DetailsMenuWrapper closed={closed} onOpenChange={onOpenChange}>
      <ContextMenuTrigger onTrigger={onTrigger} openOnClick>
        {children}
      </ContextMenuTrigger>
      <DetailsMenuContentWrapper closed={closed}>
        <ContextMenuRadioGroup
          onValueChange={(value) =>
            onValueChange(value as 'copy' | 'view' | 'speedUp' | 'cancel')
          }
        >
          {transaction?.status === 'pending' && (
            <>
              <ContextMenuRadioItem value={'speedUp'}>
                <DetailsMenuRow>
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
                </DetailsMenuRow>
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value={'cancel'}>
                <DetailsMenuRow>
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
                </DetailsMenuRow>
              </ContextMenuRadioItem>
              <Box paddingVertical="4px">
                <ContextMenuSeparator />
              </Box>
            </>
          )}
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
                  {transaction?.chainId === ChainId.mainnet
                    ? i18n.t('speed_up_and_cancel.view_on_etherscan')
                    : i18n.t('speed_up_and_cancel.view_on_explorer')}
                </Text>
              </Inline>
              <Box
                background={'fillSecondary'}
                padding="4px"
                borderRadius="3px"
                boxShadow="1px"
              >
                <Text size="12pt" color="labelSecondary" weight="semibold">
                  {shortcuts.activity.VIEW_TRANSACTION.display}
                </Text>
              </Box>
            </DetailsMenuRow>
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="copy">
            <DetailsMenuRow>
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
              <Box
                background={'fillSecondary'}
                padding="4px"
                borderRadius="3px"
                boxShadow="1px"
              >
                <Text size="12pt" color="labelSecondary" weight="semibold">
                  {shortcuts.activity.COPY_TRANSACTION.display}
                </Text>
              </Box>
            </DetailsMenuRow>
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </DetailsMenuContentWrapper>
    </DetailsMenuWrapper>
  );
}
