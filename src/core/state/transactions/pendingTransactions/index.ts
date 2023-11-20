import { isAddress } from '@ethersproject/address';
import { Address } from 'wagmi';
import create from 'zustand';

import { NewTransaction, PendingTransaction } from '~/core/types/transactions';
import { parseNewTransaction } from '~/core/utils/transactions';

import { currentCurrencyStore } from '../../currentSettings';
import { createStore } from '../../internal/createStore';

export interface PendingTransactionsState {
  [key: Address]: {
    pendingTransactions: PendingTransaction[];
  };
  getPendingTransactions: ({
    address,
  }: {
    address?: Address;
  }) => PendingTransaction[];
  setPendingTransactions: ({
    address,
    pendingTransactions,
  }: {
    address?: Address;
    pendingTransactions: PendingTransaction[];
  }) => void;
  clearPendingTransactions: () => void;
}

export const pendingTransactionsStore = createStore<PendingTransactionsState>(
  (set, get) => ({
    getPendingTransactions: ({ address }) => {
      if (address) {
        const { currentCurrency } = currentCurrencyStore.getState();
        const pendingTransactions = (
          get()?.[address]?.pendingTransactions || []
        ).map((tx) => {
          if (tx?.status === 'pending') {
            return parseNewTransaction(tx as NewTransaction, currentCurrency);
          } else {
            return tx;
          }
        });
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
    clearPendingTransactions: () => {
      set({});
    },
  }),
  {
    persist: {
      name: 'pendingTransactions',
      version: 1,
      migrate(persistedState, version) {
        const state = persistedState as PendingTransactionsState;
        if (version === 0) {
          Object.keys(state).forEach((address) => {
            if (!isAddress(address)) return;
            state[address]?.pendingTransactions?.forEach((tx) => {
              if ('pending' in tx) {
                tx.status = 'pending';
                delete tx.pending;
              }
            });
          });
        }
        return state;
      },
    },
  },
);

export const usePendingTransactionsStore = create(pendingTransactionsStore);
