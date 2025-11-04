import { createBaseStore } from 'stores';

import { RainbowTransaction } from '~/core/types/transactions';

export interface SelectedTransactionState {
  getSelectedTransaction: () => RainbowTransaction | null;
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const useSelectedTransactionStore =
  createBaseStore<SelectedTransactionState>((set, get) => ({
    getSelectedTransaction: () => get()?.selectedTransaction,
    setSelectedTransaction: (selectedTransaction?: RainbowTransaction) => {
      set({ selectedTransaction });
    },
    selectedTransaction: null,
  }));
