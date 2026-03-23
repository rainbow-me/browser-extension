import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { RainbowTransaction } from '~/core/types/transactions';

import { createExtensionStoreOptions } from '../../_internal';
import { migrateApprovalAmountToBigInt } from '../migrateApprovalAmount';

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

export const useCustomNetworkTransactionsStore =
  createBaseStore<CustomNetworkTransactionsState>(
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
        set({
          customNetworkTransactions: {
            ...customNetworkTransactions,
            [address]: {
              ...addressTransactions,
              [chainId]: [...addressChainIdTransactions, transaction],
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
    createExtensionStoreOptions({
      storageKey: 'customNetworkTransactions',
      version: 1,
      migrate(persistedState, version) {
        const state = persistedState as CustomNetworkTransactionsState;
        if (version === 0) {
          return {
            ...state,
            customNetworkTransactions: Object.fromEntries(
              Object.entries(state.customNetworkTransactions).map(
                ([address, chainTxs]) => [
                  address,
                  migrateApprovalAmountToBigInt(chainTxs),
                ],
              ),
            ),
          };
        }
        return state;
      },
    }),
  );
