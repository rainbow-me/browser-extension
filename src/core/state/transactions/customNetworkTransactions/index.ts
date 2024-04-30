import { Address } from 'wagmi';
import create from 'zustand';

import { RainbowTransaction } from '~/core/types/transactions';

import { createStore } from '../../internal/createStore';

export interface CustomNetworkTransactionsState {
  customNetworkTransactions: Record<
    Address,
    Record<number, RainbowTransaction[]>
  >;
  getCustomNetworkTransactions: ({
    address,
  }: {
    address: Address;
  }) => RainbowTransaction[];
  addCustomNetworkTransactions: ({
    address,
    chainId,
    transaction,
  }: {
    address: Address;
    chainId: number;
    transaction: RainbowTransaction;
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
        const addressTransactions = customNetworkTransactions[address] || {};
        return Object.values(addressTransactions)
          .map((transactions) => transactions)
          .flat();
      },
      addCustomNetworkTransactions: ({ address, chainId, transaction }) => {
        const { customNetworkTransactions } = get();
        const addressTransactions = customNetworkTransactions[address] || {};
        const addressChainIdTransactions = addressTransactions[chainId] || [];
        addressChainIdTransactions.push(transaction);
        set({
          customNetworkTransactions: {
            ...customNetworkTransactions,
            [address]: {
              ...addressTransactions,
              [chainId]: addressChainIdTransactions,
            },
          },
        });
      },
      clearCustomNetworkTransactions: ({ address, chainId }) => {
        const { customNetworkTransactions } = get();
        const addressTransactions = customNetworkTransactions[address] || {};
        delete addressTransactions[chainId];
        set({
          customNetworkTransactions: {
            ...customNetworkTransactions,
            [address]: {
              ...addressTransactions,
            },
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
