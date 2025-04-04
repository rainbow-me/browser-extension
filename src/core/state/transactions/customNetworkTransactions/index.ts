import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { RainbowTransaction } from '~/core/types/transactions';

import { withSelectors } from '../../internal/withSelectors';

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
  createRainbowStore<CustomNetworkTransactionsState>(
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
      storageKey: 'customNetworkTransactions',
      version: 0,
    },
  );

export const useCustomNetworkTransactionsStore = withSelectors(
  customNetworkTransactionsStore,
);
