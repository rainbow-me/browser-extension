import { createBaseStore } from 'stores';

import { RainbowTransaction } from '~/core/types/transactions';

import { createExtensionStoreOptions } from '../_internal';

export interface SelectedTransactionState {
  getSelectedTransaction: () => RainbowTransaction | null;
  setSelectedTransaction: (transaction?: RainbowTransaction) => void;
  selectedTransaction: RainbowTransaction | null;
}

export const useSelectedTransactionStore =
  createBaseStore<SelectedTransactionState>(
    (set, get) => ({
      getSelectedTransaction: () => get()?.selectedTransaction,
      setSelectedTransaction: (selectedTransaction?: RainbowTransaction) => {
        set({ selectedTransaction });
      },
      selectedTransaction: null,
    }),
    createExtensionStoreOptions({
      storageKey: 'selectedTransaction',
      version: 0,
    }),
  );
