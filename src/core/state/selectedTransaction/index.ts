import { createBaseStore } from 'stores';

import { RainbowTransaction } from '~/core/types/transactions';

export interface SelectedTransactionState {
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const useSelectedTransactionStore =
  createBaseStore<SelectedTransactionState>((set) => ({
    setSelectedTransaction: (selectedTransaction?: RainbowTransaction) =>
      set({ selectedTransaction }),
    selectedTransaction: null,
  }));
