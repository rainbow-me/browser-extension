import { createBaseStore } from '@storesjs/stores';
import { Address, isAddress } from 'viem';

import { RainbowTransaction } from '~/core/types/transactions';

import { createExtensionStoreOptions } from '../../_internal';

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
  removePendingTransactionsForAddress: ({
    address,
    transactionsToRemove,
  }: {
    address: Address;
    transactionsToRemove: Array<Pick<RainbowTransaction, 'hash' | 'chainId'>>;
  }) => void;
  clearPendingTransactions: () => void;
}

export const usePendingTransactionsStore =
  createBaseStore<PendingTransactionsState>(
    (set, get) => ({
      pendingTransactions: {},
      updatePendingTransaction: ({ address, pendingTransaction }) =>
        set(({ pendingTransactions: currentPendingTransactions }) => {
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
          return {
            pendingTransactions: {
              ...currentPendingTransactions,
              [address]: orderedPendingTransactions,
            },
          };
        }),
      removePendingTransactionsForAddress: ({
        address,
        transactionsToRemove,
      }) => {
        function removeTransactions(
          oldPendingTransactions: RainbowTransaction[],
          transactionsToRemove: Array<
            Pick<RainbowTransaction, 'hash' | 'chainId'>
          >,
        ) {
          const removeKeys = new Set<string>();
          transactionsToRemove.forEach(({ hash, chainId }) => {
            removeKeys.add(`${hash}-${chainId}`);
          });
          return oldPendingTransactions.filter((tx) => {
            const key = `${tx.hash}-${tx.chainId}`;
            return !removeKeys.has(key);
          });
        }
        // Stage 1: Determine if update is needed (outside set)
        const { pendingTransactions: currentPendingTransactions } = get();
        const existingTransactions = currentPendingTransactions[address] || [];

        // Filter out transactions to remove
        const updatedTransactions = removeTransactions(
          existingTransactions,
          transactionsToRemove,
        );

        // Check if result is actually different
        if (updatedTransactions.length === existingTransactions.length) {
          // Nothing changed - don't call set()
          return;
        }

        // Stage 2: Only call set() if update is actually needed and only use the most up-to-date state inside set()
        set(({ pendingTransactions: latestPendingTransactions }) => {
          return {
            pendingTransactions: {
              ...latestPendingTransactions,
              [address]: removeTransactions(
                latestPendingTransactions[address] || [],
                transactionsToRemove,
              ),
            },
          };
        });
      },
      clearPendingTransactions: () => {
        set({ pendingTransactions: {} });
      },
    }),
    createExtensionStoreOptions({
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
    }),
  );
