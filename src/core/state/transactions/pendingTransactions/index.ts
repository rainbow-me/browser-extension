import { isAddress } from '@ethersproject/address';
import { Address } from 'wagmi';
import create from 'zustand';

import { RainbowTransaction } from '~/core/types/transactions';

import { createStore } from '../../internal/createStore';

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
  clearPendingTransactions: () => void;
}

export const pendingTransactionsStore = createStore<PendingTransactionsState>(
  (set, get) => ({
    getPendingTransactions: ({ address }) => {
      if (address) {
        const pendingTransactions = get()?.[address]?.pendingTransactions;
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
