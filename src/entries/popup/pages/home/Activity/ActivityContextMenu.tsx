import { ReactNode, useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { copy } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';
import { Box, Text } from '~/design-system';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../../components/ContextMenu/ContextMenu';
import { DetailsMenuWrapper } from '../../../components/DetailsMenu';

export function ActivityContextMenu({
  children,
  transaction, // onRevoke,
  onRevokeTransaction,
}: {
  children: ReactNode;
  transaction: RainbowTransaction;
  onRevokeTransaction?: () => void;
}) {
  const { sheet, setCurrentHomeSheet } = useCurrentHomeSheetStore();
  const { setSelectedTransaction } = useSelectedTransactionStore();
  // need to control this manually so that menu closes when sheet appears
  const [closed, setClosed] = useState(false);
  const onOpenChange = () => setClosed(false);

  const truncatedHash = truncateAddress(transaction.hash);

  const handleCopy = () => {
    copy({
      title: i18n.t('speed_up_and_cancel.handle_copy_title'),
      description: truncatedHash,
      value: transaction.hash,
    });
  };

  const viewOnExplorer = () => {
    const explorer = getTransactionBlockExplorerUrl(transaction);
    goToNewTab({ url: explorer });
  };

  const onSpeedUp = () => {
    setCurrentHomeSheet('speedUp');
    setClosed(true);
  };

  const onCancel = () => {
    setCurrentHomeSheet('cancel');
    setClosed(true);
  };

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
      <ContextMenuTrigger onTrigger={onTrigger}>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {transaction?.status === 'pending' && (
          <>
            <ContextMenuItem
              symbolLeft="🚀"
              onSelect={onSpeedUp}
              shortcut={shortcuts.activity.SPEED_UP_TRANSACTION.display}
            >
              {i18n.t('speed_up_and_cancel.speed_up')}
            </ContextMenuItem>

            <ContextMenuItem
              symbolLeft="☠️"
              onSelect={onCancel}
              shortcut={shortcuts.activity.CANCEL_TRANSACTION.display}
            >
              {i18n.t('speed_up_and_cancel.cancel')}
            </ContextMenuItem>

            <Box paddingVertical="4px">
              <ContextMenuSeparator />
            </Box>
          </>
        )}

        <ContextMenuItem
          symbolLeft="binoculars.fill"
          onSelect={viewOnExplorer}
          shortcut={shortcuts.activity.VIEW_TRANSACTION.display}
        >
          {transaction?.chainId === ChainId.mainnet
            ? i18n.t('speed_up_and_cancel.view_on_etherscan')
            : i18n.t('speed_up_and_cancel.view_on_explorer')}
        </ContextMenuItem>

        <ContextMenuItem
          symbolLeft="doc.on.doc.fill"
          onSelect={handleCopy}
          shortcut={shortcuts.activity.COPY_TRANSACTION.display}
        >
          <Text color="label" size="14pt" weight="semibold">
            {i18n.t('speed_up_and_cancel.copy_tx_hash')}
          </Text>
          <Text color="labelSecondary" size="12pt" weight="semibold">
            {truncatedHash}
          </Text>
        </ContextMenuItem>

        {onRevokeTransaction ? (
          <ContextMenuItem
            color="red"
            symbolLeft="xmark.circle.fill"
            onSelect={onRevokeTransaction}
            shortcut={shortcuts.activity.REFRESH_TRANSACTIONS.display}
          >
            <Text color="red" size="14pt" weight="semibold">
              {'Revoke Approval'}
            </Text>
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
