import { Address } from 'wagmi';
import create from 'zustand';

import { NewTransaction, RainbowTransaction } from '~/core/types/transactions';
import { parseNewTransaction } from '~/core/utils/transactions';

import { currentCurrencyStore } from '../currentSettings';
import { createStore } from '../internal/createStore';

export interface PendingTransactionsState {
  [key: Address]: {
    pendingTransactions: RainbowTransaction[];
  };
  getPendingTransactions: ({
    address,
  }: {
    address?: Address;
  }) => RainbowTransaction[];
  setPendingTransactions: ({
    address,
    pendingTransactions,
  }: {
    address?: Address;
    pendingTransactions: RainbowTransaction[];
  }) => void;
}

export const pendingTransactionsStore = createStore<PendingTransactionsState>(
  (set, get) => ({
    getPendingTransactions: ({ address }) => {
      if (address) {
        const { currentCurrency } = currentCurrencyStore.getState();
        const pendingTransactions = (
          get()?.[address]?.pendingTransactions || []
        ).map((tx) =>
          parseNewTransaction(tx as NewTransaction, currentCurrency),
        );
        return pendingTransactions;
      }

      return [];
    },
    setPendingTransactions: ({ address, pendingTransactions }) => {
      if (address) {
        set({
          [address]: {
            pendingTransactions,
          },
        });
      }
    },
  }),
  {
    persist: {
      name: 'pendingTransactions',
      version: 0,
    },
  },
);

export const usePendingTransactionsStore = create(pendingTransactionsStore);
