import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { RainbowTransaction } from '~/core/types/transactions';

export interface SelectedTransactionState {
  getSelectedTransaction: () => RainbowTransaction | null;
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const useSelectedTransactionStore =
  createRainbowStore<SelectedTransactionState>((set, get) => ({
    getSelectedTransaction: () => get()?.selectedTransaction,
    setSelectedTransaction: (selectedTransaction?: RainbowTransaction) => {
      set({ selectedTransaction });
    },
    selectedTransaction: null,
  }));
