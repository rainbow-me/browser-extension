import { isAddress } from '@ethersproject/address';
import { Address } from 'wagmi';
import create from 'zustand';

import { RainbowTransaction } from '~/core/types/transactions';

import { createStore } from '../../internal/createStore';

export interface PendingTransactionsStateV1 {
  [key: Address]: {
    pendingTransactions: RainbowTransaction[];
  };
}

export interface PendingTransactionsState {
  pendingTransactions: Record<Address, RainbowTransaction[]>;
  setPendingTransactions: ({
    address,
    pendingTransactions,
  }: {
    address: Address;
    pendingTransactions: RainbowTransaction[];
  }) => void;
  clearPendingTransactions: () => void;
}

export const pendingTransactionsStore = createStore<PendingTransactionsState>(
  (set, get) => ({
    pendingTransactions: {},
    setPendingTransactions: ({ address, pendingTransactions }) => {
      const { pendingTransactions: currentPendingTransactions } = get();
      set({
        pendingTransactions: {
          ...currentPendingTransactions,
          [address]: [...pendingTransactions],
        },
      });
    },
    clearPendingTransactions: () => {
      set({});
    },
  }),
  {
    persist: {
      name: 'pendingTransactions',
      version: 2,
      migrate(
        persistedState,
        version,
      ): PendingTransactionsState | Promise<PendingTransactionsState> {
        const state = persistedState as PendingTransactionsState;
        if (version === 0) {
          const oldState = persistedState as PendingTransactionsStateV1;
          const addresses = Object.keys(oldState);
          const pendingTransactions: { [key: string]: RainbowTransaction[] } =
            addresses.reduce(
              (accumulator, currentKey) => {
                accumulator[currentKey] = [];
                return accumulator;
              },
              {} as Record<string, RainbowTransaction[]>,
            );
          addresses.forEach((address) => {
            if (!isAddress(address)) return;
            oldState[address]?.pendingTransactions?.forEach((tx) => {
              if ('pending' in tx) {
                tx.status = 'pending';
                delete tx.pending;
                pendingTransactions[address]?.push(tx);
              }
            });
          });
          const state = persistedState as PendingTransactionsState;
          state.pendingTransactions = pendingTransactions;
          return state;
        }
        if (version === 1) {
          const oldState = persistedState as PendingTransactionsStateV1;
          const addresses = Object.keys(oldState);
          const pendingTransactions: { [key: string]: RainbowTransaction[] } =
            addresses.reduce(
              (accumulator, currentKey) => {
                accumulator[currentKey] = [];
                return accumulator;
              },
              {} as Record<string, RainbowTransaction[]>,
            );
          const state = persistedState as PendingTransactionsState;
          addresses.forEach((address) => {
            if (!isAddress(address)) return;
            oldState[address]?.pendingTransactions?.forEach((tx) => {
              pendingTransactions[address]?.push(tx);
            });
          });
          state.pendingTransactions = pendingTransactions;
          return state;
        }
        return state;
      },
    },
  },
);

export const usePendingTransactionsStore = create(pendingTransactionsStore);
