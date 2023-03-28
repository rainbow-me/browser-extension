import React, { useCallback, useMemo } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';

import { SpeedUpAndCancelSheet } from '../pages/speedUpAndCancelSheet';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export function useCurrentHomeSheet() {
  const { setCurrentHomeSheet, sheet } = useCurrentHomeSheetStore();
  const { selectedTransaction } = useSelectedTransactionStore();

  const closeSheet = useCallback(
    () => setCurrentHomeSheet('none'),
    [setCurrentHomeSheet],
  );

  const currentHomeSheet = useMemo(() => {
    switch (sheet) {
      case 'cancel':
      case 'speedUp':
        return (
          <SpeedUpAndCancelSheet
            currentSheet={sheet}
            onClose={closeSheet}
            transaction={selectedTransaction}
          />
        );
      default:
        return null;
    }
  }, [closeSheet, selectedTransaction, sheet]);

  const isDisplayingSheet = useMemo(() => sheet !== 'none', [sheet]);

  useKeyboardShortcut({
    condition: () => isDisplayingSheet,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        closeSheet();
        e.preventDefault();
      }
    },
  });

  return {
    currentHomeSheet,
    isDisplayingSheet,
  };
}
