import { Address } from 'viem';

import { createStore } from '~/core/state/internal/createStore';
import { ChainId } from '~/core/types/chains';

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

export const staleBalancesStore = createStore<StaleBalancesState>(
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
      let queryStringFragment = '';
      const { staleBalances } = get();
      const staleBalancesForUser = staleBalances[address];
      for (const c of Object.keys(staleBalancesForUser)) {
        const chainId = parseInt(c, 10);
        const staleBalancesForChain = staleBalancesForUser[chainId];
        for (const staleBalance of Object.values(staleBalancesForChain)) {
          if (typeof staleBalance.expirationTime === 'number') {
            queryStringFragment += `&token=${chainId}.${staleBalance.address}`;
          }
        }
      }
      return queryStringFragment;
    },
    staleBalances: {},
  }),
  {
    persist: {
      name: 'staleBalances',
      version: 0,
    },
  },
);

export const useStaleBalancesStore = staleBalancesStore;
