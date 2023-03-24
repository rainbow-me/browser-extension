import React, { useCallback } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentSheetStore } from '~/core/state/currentSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';

import { SpeedUpAndCancelSheet } from '../pages/speedUpAndCancelSheet';

import { useKeyboardShortcut } from './useKeyboardShortcut';

export default function useSheet() {
  const { setCurrentSheet, sheet } = useCurrentSheetStore();
  const { selectedTransaction } = useSelectedTransactionStore();

  const renderCurrentSheet = useCallback(() => {
    switch (sheet) {
      case 'cancel':
      case 'speedUp':
        return <SpeedUpAndCancelSheet transaction={selectedTransaction} />;
      default:
        return null;
    }
  }, [selectedTransaction, sheet]);

  const getIsDisplayingSheet = useCallback(() => sheet !== 'none', [sheet]);

  useKeyboardShortcut({
    condition: getIsDisplayingSheet,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        setCurrentSheet('none');
        e.preventDefault();
      }
    },
  });

  return {
    isDisplayingSheet: getIsDisplayingSheet(),
    renderCurrentSheet,
  };
}
