import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { RainbowTransaction } from '~/core/types/transactions';

import { withSelectors } from '../internal/withSelectors';

export interface SelectedTransactionState {
  getSelectedTransaction: () => RainbowTransaction | null;
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const selectedTransactionStore =
  createRainbowStore<SelectedTransactionState>((set, get) => ({
    getSelectedTransaction: () => get()?.selectedTransaction,
    setSelectedTransaction: (selectedTransaction?: RainbowTransaction) => {
      set({ selectedTransaction });
    },
    selectedTransaction: null,
  }));

export const useSelectedTransactionStore = withSelectors(
  selectedTransactionStore,
);
