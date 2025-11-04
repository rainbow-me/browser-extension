import { createBaseStore } from 'stores';
import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';
import { isAddressOrEth } from '~/core/utils/platform';

import { createExtensionStoreOptions } from '../_internal';

const TIME_TO_WATCH = 600000;

interface StaleBalanceInfo {
  address: Address;
  expirationTime?: number;
  transactionHash: string;
}

interface StaleBalances {
  [key: Address]: StaleBalanceInfo;
}
interface StaleBalancesByChainId {
  [key: number]: StaleBalances;
}

export interface StaleBalancesState {
  addStaleBalance: ({
    address,
    chainId,
    info,
  }: {
    address: Address;
    chainId: ChainId;
    info: StaleBalanceInfo;
  }) => void;
  clearExpiredData: (address: Address) => void;
  getStaleBalancesQueryParam: (address: Address) => string;
  staleBalances: Record<Address, StaleBalancesByChainId>;
}

export const useStaleBalancesStore = createBaseStore<StaleBalancesState>(
  (set, get) => ({
    addStaleBalance: ({
      address,
      chainId,
      info,
    }: {
      address: Address;
      chainId: ChainId;
      info: StaleBalanceInfo;
    }) => {
      set((state) => {
        const { staleBalances } = state;
        const staleBalancesForUser = staleBalances[address] || {};
        const staleBalancesForChain = staleBalancesForUser[chainId] || {};
        const newStaleBalancesForChain = {
          ...staleBalancesForChain,
          [info.address]: {
            ...info,
            expirationTime: info.expirationTime || Date.now() + TIME_TO_WATCH,
          },
        };
        const newStaleBalancesForUser = {
          ...staleBalancesForUser,
          [chainId]: newStaleBalancesForChain,
        };
        return {
          staleBalances: {
            ...staleBalances,
            [address]: newStaleBalancesForUser,
          },
        };
      });
    },
    clearExpiredData: (address: Address) => {
      set((state) => {
        const { staleBalances } = state;
        const staleBalancesForUser = staleBalances[address] || {};
        const newStaleBalancesForUser: StaleBalancesByChainId = {
          ...staleBalancesForUser,
        };
        for (const c of Object.keys(staleBalancesForUser)) {
          const chainId = parseInt(c, 10);
          const newStaleBalancesForChain = {
            ...(staleBalancesForUser[chainId] || {}),
          };
          for (const staleBalance of Object.values(newStaleBalancesForChain)) {
            if (
              typeof staleBalance.expirationTime === 'number' &&
              staleBalance.expirationTime <= Date.now()
            ) {
              delete newStaleBalancesForChain[staleBalance.address];
            }
          }
          newStaleBalancesForUser[chainId] = newStaleBalancesForChain;
        }
        return {
          staleBalances: {
            ...staleBalances,
            [address]: newStaleBalancesForUser,
          },
        };
      });
    },
    getStaleBalancesQueryParam: (address: Address) => {
      const { staleBalances } = get();
      const staleBalancesForUser = staleBalances[address];
      const tokenList: string[] = [];

      if (!staleBalancesForUser) {
        return '';
      }

      for (const c of Object.keys(staleBalancesForUser)) {
        const chainId = parseInt(c, 10);
        if (isNaN(chainId)) continue;

        const staleBalancesForChain = staleBalancesForUser[chainId];
        if (!staleBalancesForChain) continue;

        for (const staleBalance of Object.values(staleBalancesForChain)) {
          if (
            typeof staleBalance.expirationTime === 'number' &&
            staleBalance.address &&
            isAddressOrEth(staleBalance.address)
          ) {
            tokenList.push(`${staleBalance.address}:${chainId}`);
          }
        }
      }

      return tokenList.length > 0 ? `&tokens=${tokenList.join(',')}` : '';
    },
    staleBalances: {},
  }),
  createExtensionStoreOptions({
    storageKey: 'staleBalances',
    version: 0,
  }),
);
