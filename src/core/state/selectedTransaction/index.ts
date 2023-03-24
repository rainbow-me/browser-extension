import create from 'zustand';

import { RainbowTransaction } from '~/core/types/transactions';

import { createStore } from '../internal/createStore';

export interface SelectedTransactionState {
  getSelectedTransaction: () => RainbowTransaction | null;
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const selectedTransactionStore = createStore<SelectedTransactionState>(
  (set, get) => ({
    getSelectedTransaction: () => get()?.selectedTransaction,
    setSelectedTransaction: (selectedTransaction?: RainbowTransaction) => {
      console.log('setting selected transaction: ', selectedTransaction);
      set({ selectedTransaction });
    },
    selectedTransaction: null,
  }),
);

export const useSelectedTransactionStore = create(selectedTransactionStore);
