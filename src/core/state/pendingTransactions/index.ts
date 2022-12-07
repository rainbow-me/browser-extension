import { Address } from 'wagmi';
import create from 'zustand';

import { RainbowTransaction } from '~/core/types/transactions';

import { createStore } from '../internal/createStore';

export interface PendingTransactionsStore {
  [key: Address]: {
    pendingTransactions: RainbowTransaction[];
  };
  setPendingTransactions: ({
    address,
    pendingTransactions,
  }: {
    address: Address;
    pendingTransactions: RainbowTransaction[];
  }) => void;
}

export const pendingTransactionStore = createStore<PendingTransactionsStore>(
  (set) => ({
    setPendingTransactions: ({ address, pendingTransactions }) => {
      set({
        [address]: {
          pendingTransactions,
        },
      });
    },
  }),
);

export const usePendingTransactionsStore = create(pendingTransactionStore);
