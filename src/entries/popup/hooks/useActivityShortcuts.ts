import { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentSheetStore } from '~/core/state/currentSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useActivityShortcuts() {
  const { selectedTransaction } = useSelectedTransactionStore();
  const { sheet, setCurrentSheet } = useCurrentSheetStore();
  const getTransactionIsSelected = useCallback(
    () => !!selectedTransaction,
    [selectedTransaction],
  );
  const handleActivityShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (selectedTransaction?.pending) {
        if (sheet === 'none') {
          if (e.key === shortcuts.activity.CANCEL_TRANSACTION.key) {
            setCurrentSheet('cancel');
          } else if (e.key === shortcuts.activity.SPEED_UP_TRANSACTION.key) {
            setCurrentSheet('speedUp');
          }
        }
      }
    },
    [selectedTransaction, setCurrentSheet, sheet],
  );
  useKeyboardShortcut({
    condition: getTransactionIsSelected,
    handler: handleActivityShortcuts,
  });
}
