import { create } from 'zustand';

import { RainbowTransaction } from '~/core/types/transactions';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

export interface SelectedTransactionState {
  getSelectedTransaction: () => RainbowTransaction | null;
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const selectedTransactionStore = createStore<SelectedTransactionState>(
  (set, get) => ({
    getSelectedTransaction: () => get()?.selectedTransaction,
    setSelectedTransaction: (selectedTransaction?: RainbowTransaction) => {
      set({ selectedTransaction });
    },
    selectedTransaction: null,
  }),
);

export const useSelectedTransactionStore = withSelectors(
  create(selectedTransactionStore),
);
