import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { ChainId } from '~/core/types/chains';
import { RainbowTransaction } from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { copy } from '~/core/utils/copy';
import { goToNewTab } from '~/core/utils/tabs';
import { getTransactionBlockExplorer } from '~/core/utils/transactions';
import { Box, Text } from '~/design-system';
import { DetailsMenuWrapper } from '~/entries/popup/components/DetailsMenu';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../../components/ContextMenu/ContextMenu';

export function ActivityContextMenu({
  children,
  transaction,
  onRevokeTransaction,
}: {
  children: ReactNode;
  transaction: RainbowTransaction;
  onRevokeTransaction?: () => void;
}) {
  const { setCurrentHomeSheet } = useCurrentHomeSheetStore();
  const { setSelectedTransaction } = useSelectedTransactionStore();
  const [open, setOpen] = useState(false);
  const revokeRef = useRef<HTMLDivElement>(null);

  const truncatedHash = truncateAddress(transaction.hash);

  const handleCopy = () => {
    copy({
      title: i18n.t('speed_up_and_cancel.handle_copy_title'),
      description: truncatedHash,
      value: transaction.hash,
    });
  };

  const viewOnExplorer = () => {
    const explorer = getTransactionBlockExplorer(transaction);
    goToNewTab({ url: explorer?.url });
  };

  const onSpeedUp = () => {
    setCurrentHomeSheet('speedUp');
  };

  const onCancel = () => {
    setCurrentHomeSheet('cancel');
  };

  const onTrigger = useCallback(
    () => setSelectedTransaction(transaction),
    [transaction, setSelectedTransaction],
  );

  const onRevoke = useCallback(() => {
    revokeRef?.current?.click();
    onRevokeTransaction?.();
  }, [onRevokeTransaction]);

  useKeyboardShortcut({
    condition: () => !!open,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.activity.REFRESH_TRANSACTIONS.key) {
        onRevoke();
        e.preventDefault();
      }
      if (e.key === shortcuts.global.CLOSE.key) {
        setOpen(false);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      setSelectedTransaction(undefined);
    }
  }, [open, setSelectedTransaction]);

  return (
    <DetailsMenuWrapper onOpenChange={setOpen} closed={!open}>
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

        <Box testId="activity-context-copy-tx-hash">
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
        </Box>

        {onRevokeTransaction ? (
          <ContextMenuItem
            color="red"
            symbolLeft="xmark.circle.fill"
            onSelect={onRevoke}
            shortcut={shortcuts.activity.REFRESH_TRANSACTIONS.display}
          >
            <Box ref={revokeRef}>
              <Text color="red" size="14pt" weight="semibold">
                {i18n.t('speed_up_and_cancel.revoke_approval')}
              </Text>
            </Box>
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </DetailsMenuWrapper>
  );
}
