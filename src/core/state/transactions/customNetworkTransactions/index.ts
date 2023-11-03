import { Address } from 'wagmi';
import create from 'zustand';

import { MinedTransaction } from '~/core/types/transactions';

import { createStore } from '../../internal/createStore';

export interface CustomNetworkTransactionsState {
  customNetworkTransactions: Record<
    Address,
    Record<number, MinedTransaction[]>
  >;
  getCustomNetworkTransactions: ({
    address,
  }: {
    address: Address;
  }) => MinedTransaction[];
  addCustomNetworkTransactions: ({
    address,
    chainId,
    transaction,
  }: {
    address: Address;
    chainId: number;
    transaction: MinedTransaction;
  }) => void;
  clearCustomNetworkTransactions: ({
    address,
    chainId,
  }: {
    address: Address;
    chainId: number;
  }) => void;
  clearAllCustomNetworkTransactions: () => void;
}

export const customNetworkTransactionsStore =
  createStore<CustomNetworkTransactionsState>(
    (set, get) => ({
      customNetworkTransactions: {},
      getCustomNetworkTransactions: ({ address }) => {
        const { customNetworkTransactions } = get();
        const addressTransactions = customNetworkTransactions[address];
        return Object.values(addressTransactions)
          .map((transactions) => transactions)
          .flat()
          .sort((a, b) => (a.minedAt > b.minedAt ? 0 : 1));
      },
      addCustomNetworkTransactions: ({ address, chainId, transaction }) => {
        const { customNetworkTransactions } = get();
        const addressTransactions = customNetworkTransactions[address] || {};
        const addressChainIdTransactions = addressTransactions[chainId] || [];
        addressChainIdTransactions.push(transaction);
        set({
          ...customNetworkTransactions,
          [address]: {
            ...addressTransactions,
            [chainId]: addressChainIdTransactions,
          },
        });
      },
      clearCustomNetworkTransactions: ({ address, chainId }) => {
        const { customNetworkTransactions } = get();
        const addressTransactions = customNetworkTransactions[address] || {};
        delete addressTransactions[chainId];
        set({
          ...customNetworkTransactions,
          [address]: {
            ...addressTransactions,
          },
        });
      },
      clearAllCustomNetworkTransactions: () => {
        set({ customNetworkTransactions: {} });
      },
    }),
    {
      persist: {
        name: 'customNetworkTransactions',
        version: 0,
      },
    },
  );

export const useCustomNetworkTransactionsStore = create(
  customNetworkTransactionsStore,
);
