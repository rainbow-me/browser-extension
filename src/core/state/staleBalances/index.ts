import { Address } from 'viem';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

const TIME_TO_WATCH = 600000;

interface StaleBalanceInfo {
  address: Address;
  expirationTime?: number;
  nonce: number;
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
  createStaleBalanceExpiration: ({
    address,
    chainId,
    assetAddress,
  }: {
    address: Address;
    chainId: ChainId;
    assetAddress: Address;
  }) => void;
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
      const staleBalances = { ...get().staleBalances };
      const staleBalancesForUser = staleBalances[address] || {};
      const staleBalancesForChain = staleBalancesForUser[chainId] || {};
      const newStaleBalancesForChain = {
        ...staleBalancesForChain,
        [info.address]: info,
      };
      const newStaleBalancesForUser = {
        ...staleBalancesForUser,
        [chainId]: newStaleBalancesForChain,
      };
      console.log(
        'ADDING STALE BALANCES INTERNAL: ',
        staleBalances,
        newStaleBalancesForUser,
      );
      console.log('setting 3', staleBalances, newStaleBalancesForUser);
      set({
        staleBalances: {
          ...staleBalances,
          [address]: newStaleBalancesForUser,
        },
      });
    },
    clearExpiredData: (address: Address) => {
      set((state) => {
        const staleBalances = state.staleBalances;
        const staleBalancesForUser = staleBalances[address] || {};
        const newStaleBalancesForUser: StaleBalancesByChainId = {
          ...staleBalancesForUser,
        };
        console.log('clear expired data: ', address);
        console.log('stale balances in clear expired data: ', staleBalances);
        for (const c of Object.keys(staleBalancesForUser)) {
          const chainId = parseInt(c);
          const newStaleBalancesForChain = {
            ...(staleBalancesForUser[chainId] || {}),
          };
          for (const staleBalance of Object.values(newStaleBalancesForChain)) {
            if (
              typeof staleBalance.expirationTime === 'number' &&
              staleBalance.expirationTime <= Date.now()
            ) {
              console.log(
                'DELETING: ',
                newStaleBalancesForChain[staleBalance.address],
              );
              delete newStaleBalancesForChain[staleBalance.address];
            }
          }
          newStaleBalancesForUser[chainId] = newStaleBalancesForChain;
        }
        console.log('setting 2', newStaleBalancesForUser);
        return {
          staleBalances: {
            ...staleBalances,
            [address]: newStaleBalancesForUser,
          },
        };
      });
    },
    createStaleBalanceExpiration: ({
      address,
      chainId,
      assetAddress,
    }: {
      address: Address;
      chainId: ChainId;
      assetAddress: Address;
    }) => {
      const staleBalances = { ...get().staleBalances };
      const staleBalancesForUser = staleBalances[address] || {};
      const staleBalancesForChain = staleBalancesForUser[chainId] || {};
      const staleBalanceToUpdate = staleBalancesForChain[assetAddress];
      if (staleBalanceToUpdate) {
        const newStaleBalance = {
          ...staleBalanceToUpdate,
          expirationTime: Date.now() + TIME_TO_WATCH,
        };
        const newStaleBalancesForChain = {
          ...staleBalancesForChain,
          [assetAddress]: newStaleBalance,
        };
        const newStaleBalancesForUser = {
          ...staleBalancesForUser,
          [chainId]: newStaleBalancesForChain,
        };
        console.log('setting 1');
        set({
          staleBalances: {
            ...staleBalances,
            [address]: newStaleBalancesForUser,
          },
        });
      }
    },
    getStaleBalancesQueryParam: (address: Address) => {
      let queryStringFragment = '';
      const { staleBalances: beforeSB } = get();
      console.log('BEFORE SB: ', beforeSB);
      //   get().clearExpiredData(address);
      const { staleBalances } = get();
      const staleBalancesForUser = staleBalances[address];
      for (const c of Object.keys(staleBalancesForUser)) {
        const chainId = parseInt(c);
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

export const useStaleBalancesStore = withSelectors(create(staleBalancesStore));
