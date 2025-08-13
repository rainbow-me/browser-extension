import { Address, isAddress } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { RainbowTransaction } from '~/core/types/transactions';

export interface PendingTransactionsStateV1 {
  [key: Address]: {
    pendingTransactions: RainbowTransaction[];
  };
}

export interface PendingTransactionsState {
  pendingTransactions: Record<Address, RainbowTransaction[]>;
  updatePendingTransaction: ({
    address,
    pendingTransaction,
  }: {
    address: Address;
    pendingTransaction: RainbowTransaction;
  }) => void;
  setPendingTransactions: ({
    address,
    pendingTransactions,
  }: {
    address: Address;
    pendingTransactions: RainbowTransaction[];
  }) => void;
  clearPendingTransactions: () => void;
}

export const usePendingTransactionsStore =
  createRainbowStore<PendingTransactionsState>(
    (set, get) => ({
      pendingTransactions: {},
      updatePendingTransaction: ({ address, pendingTransaction }) => {
        const { pendingTransactions: currentPendingTransactions } = get();
        const addressPendingTransactions =
          currentPendingTransactions[address] || [];

        const updatedPendingTransactions = [
          ...addressPendingTransactions.filter((tx) => {
            if (tx.chainId === pendingTransaction.chainId) {
              return tx.nonce !== pendingTransaction.nonce;
            }
            return true;
          }),
          pendingTransaction,
        ];
        const orderedPendingTransactions = updatedPendingTransactions.sort(
          (a, b) => {
            return (a.nonce || 0) - (b.nonce || 0);
          },
        );
        set({
          pendingTransactions: {
            ...currentPendingTransactions,
            [address]: orderedPendingTransactions,
          },
        });
      },
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
        set({ pendingTransactions: {} });
      },
    }),
    {
      storageKey: 'pendingTransactions',
      version: 2,
      migrate(persistedState, version) {
        const state = persistedState as PendingTransactionsState;
        if (version === 0) {
          const oldState = persistedState as PendingTransactionsStateV1;
          const addresses = Object.keys(oldState) as Address[];
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
          return state;
        }
        if (version === 1) {
          const oldState = persistedState as PendingTransactionsStateV1;
          const addresses = Object.keys(oldState) as Address[];
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
  );
