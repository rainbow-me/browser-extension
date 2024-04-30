import { useCallback, useMemo } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentHomeSheetStore } from '~/core/state/currentHomeSheet';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';

import { SpeedUpAndCancelSheet } from '../pages/speedUpAndCancelSheet';
import { ROUTES } from '../urls';

import useKeyboardAnalytics from './useKeyboardAnalytics';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { useRainbowNavigate } from './useRainbowNavigate';

export function useCurrentHomeSheet() {
  const { setCurrentHomeSheet, sheet } = useCurrentHomeSheetStore();
  const { selectedTransaction } = useSelectedTransactionStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const navigate = useRainbowNavigate();

  const closeSheet = useCallback(() => {
    setCurrentHomeSheet('none');
    navigate(ROUTES.HOME);
  }, [navigate, setCurrentHomeSheet]);

  const currentHomeSheet = useMemo(() => {
    switch (sheet) {
      case 'cancel':
      case 'speedUp':
        return selectedTransaction?.status === 'pending' ? (
          <SpeedUpAndCancelSheet
            currentSheet={sheet}
            onClose={closeSheet}
            transaction={selectedTransaction}
          />
        ) : null;
      default:
        return null;
    }
  }, [closeSheet, selectedTransaction, sheet]);

  const isDisplayingSheet = useMemo(() => sheet !== 'none', [sheet]);

  useKeyboardShortcut({
    condition: () => isDisplayingSheet,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        trackShortcut({
          key: shortcuts.global.CLOSE.display,
          type: 'home.dismissSheet',
        });
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
