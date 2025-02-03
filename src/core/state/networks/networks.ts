import { create } from 'zustand';
import buildTimeNetworks from 'static/data/networks.json';

import { fetchNetworks } from '~/core/resources/networks/networks';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { ChainId, Networks, UserPreferences } from '~/core/types/chains';  
import { differenceOrUnionOf, modifyUserPreferencesForNewlySupportedNetworks, buildInitialUserPreferences, toChainId } from './utils';
import { mergeNewOfficiallySupportedChainsState, useFavoritesStore } from '~/core/state/favorites';

const IS_DEV = process.env.IS_DEV === 'true';
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

export interface NetworkState {
	// NOTE: Now backend-driven networks and backend-driven custom networks are stored in the same networks object
  networks: Networks;
  userOverrides: Partial<Record<ChainId, UserPreferences>>;
}

interface NetworkActions {
  // TODO: Add actions
}

let lastNetworks: Networks | null = null;

function createSelector<T>(selectorFn: (networks: Networks, userOverrides: Partial<Record<ChainId, UserPreferences>>) => T): () => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let memoizedFn: ((networks: Networks, userOverrides: Partial<Record<ChainId, UserPreferences>>) => T) | null = null;

  return () => {
    const { networks, userOverrides } = useNetworkStore.getState();

    if (cachedResult !== uninitialized && lastNetworks === networks) {
      return cachedResult;
    }

    if (lastNetworks !== networks) lastNetworks = networks;
    if (!memoizedFn) memoizedFn = selectorFn;

    cachedResult = memoizedFn(networks, userOverrides);
    return cachedResult;
  };
}

function createParameterizedSelector<T, Args extends unknown[]>(
  selectorFn: (networks: Networks, userOverrides: Partial<Record<ChainId, UserPreferences>>) => (...args: Args) => T
): (...args: Args) => T {
  const uninitialized = Symbol();
  let cachedResult: T | typeof uninitialized = uninitialized;
  let lastArgs: Args | null = null;
  let memoizedFn: ((...args: Args) => T) | null = null;

  return (...args: Args) => {
    const { networks, userOverrides } = useNetworkStore.getState();
    const argsChanged = !lastArgs || args.length !== lastArgs.length || args.some((arg, i) => arg !== lastArgs?.[i]);

    if (cachedResult !== uninitialized && lastNetworks === networks && !argsChanged) {
      return cachedResult;
    }

    if (!memoizedFn || lastNetworks !== networks) {
      lastNetworks = networks;
      memoizedFn = selectorFn(networks, userOverrides);
    }

    lastArgs = args;
    cachedResult = memoizedFn(...args);
    return cachedResult;
  };
}

const initialState: NetworkState = {
  networks: buildTimeNetworks,
  userOverrides: buildInitialUserPreferences(),
};

export const networkStore = createQueryStore<Networks, never, NetworkState & NetworkActions>(
  {
    fetcher: fetchNetworks,
    setData: ({ data, set }) => {
      set((state) => {
        const newNetworks = differenceOrUnionOf({
          existing: state.networks.backendNetworks.networks,
          incoming: data.backendNetworks.networks,
        });

        // we don't need to check any newly supported networks
        if (newNetworks.size === 0) {
          return {
            ...state,
            networks: data
          }
        }

        // kick off a favorites store sync
        void syncNewDefaultFavorites(Array.from(newNetworks.keys()).map(toChainId));

        return {
          ...state,
          networks: data,
          userOverrides: modifyUserPreferencesForNewlySupportedNetworks(state, newNetworks)
        };
      }); 
    },
    staleTime: 10 * 60 * 1000
  },
  
  () => ({
    ...initialState,

  }),
  {
    partialize: (state) => ({
      networks: state.networks,
      userOverrides: state.userOverrides,
    }),
    storageKey: 'networkStore',
    version: 1
  }
);

export const useNetworkStore = create(networkStore);

const syncNewDefaultFavorites = (newlySupportedNetworks: ChainId[]) => {
  return mergeNewOfficiallySupportedChainsState(useFavoritesStore.getState(), newlySupportedNetworks);
};