import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useActivityShortcuts() {
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet, setCurrentHomeSheet } = useCurrentHomeSheetStore();
  const getTransactionIsSelected = useCallback(
    () => !!selectedTransaction,
    [selectedTransaction],
  );
  const handleActivityShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (selectedTransaction?.pending && sheet === 'none') {
        if (e.key === shortcuts.activity.CANCEL_TRANSACTION.key) {
          setCurrentHomeSheet('cancel');
        } else if (e.key === shortcuts.activity.SPEED_UP_TRANSACTION.key) {
          setCurrentHomeSheet('speedUp');
        }
      }
    },
    [selectedTransaction, setCurrentHomeSheet, sheet],
  );
  useKeyboardShortcut({
    condition: getTransactionIsSelected,
    handler: handleActivityShortcuts,
  });
}
