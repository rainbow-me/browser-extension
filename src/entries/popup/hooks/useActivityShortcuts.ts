import { Address } from '@wagmi/core';
import { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';
import { goToNewTab } from '~/core/utils/tabs';
import { getTransactionBlockExplorerUrl } from '~/core/utils/transactions';

import { triggerToast } from '../components/Toast/Toast';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useActivityShortcuts() {
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet, setCurrentHomeSheet } = useCurrentHomeSheetStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const getTransactionIsSelected = useCallback(
    () => !!selectedTransaction,
    [selectedTransaction],
  );

  const trimmedHash = selectedTransaction?.hash?.replace(/-.*/g, '') || '';
  const truncatedAddress = truncateAddress(trimmedHash as Address);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(trimmedHash);
    triggerToast({
      title: i18n.t('speed_up_and_cancel.handle_copy_title'),
      description: truncatedAddress,
    });
  }, [trimmedHash, truncatedAddress]);

  const viewOnExplorer = useCallback(() => {
    const explorer = getTransactionBlockExplorerUrl({
      chainId: selectedTransaction?.chainId || ChainId.mainnet,
      hash: trimmedHash,
    });
    goToNewTab({
      url: explorer,
    });
  }, [selectedTransaction?.chainId, trimmedHash]);

  const handleActivityShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (selectedTransaction?.status === 'pending' && sheet === 'none') {
        if (e.key === shortcuts.activity.CANCEL_TRANSACTION.key) {
          trackShortcut({
            key: shortcuts.activity.CANCEL_TRANSACTION.display,
            type: 'activity.cancelTransaction',
          });
          setCurrentHomeSheet('cancel');
        }
        if (e.key === shortcuts.activity.SPEED_UP_TRANSACTION.key) {
          trackShortcut({
            key: shortcuts.activity.SPEED_UP_TRANSACTION.display,
            type: 'activity.speedUpTransaction',
          });
          setCurrentHomeSheet('speedUp');
        }
      }
      if (e.key === shortcuts.activity.COPY_TRANSACTION.key) {
        trackShortcut({
          key: shortcuts.activity.COPY_TRANSACTION.display,
          type: 'activity.copyTransactionAddress',
        });
        handleCopy();
      }
      if (e.key === shortcuts.activity.VIEW_TRANSACTION.key) {
        trackShortcut({
          key: shortcuts.activity.VIEW_TRANSACTION.display,
          type: 'activity.viewTransactionOnExplorer',
        });
        viewOnExplorer();
      }
    },
    [
      handleCopy,
      selectedTransaction,
      setCurrentHomeSheet,
      sheet,
      trackShortcut,
      viewOnExplorer,
    ],
  );
  useKeyboardShortcut({
    condition: getTransactionIsSelected,
    handler: handleActivityShortcuts,
  });
}
