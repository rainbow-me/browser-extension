import isEqual from 'lodash/isEqual';
import { type Chain } from 'viem/chains';

import buildTimeNetworks from 'static/data/networks.json';
import {
  BackendNetworksResponse,
  fetchNetworks,
} from '~/core/resources/backendNetworks/backendNetworks';
import { transformBackendNetworksToChains, transformCustomNetworkToBackendNetwork } from '~/core/state/backendNetworks/utils';
import { createQueryStore } from '~/core/state/internal/createQueryStore';

const { CUSTOM_NETWORKS_QUERY } = require('../../resources/backendNetworks/sharedQueries');

const INITIAL_CUSTOM_NETWORKS = buildTimeNetworks.customNetworks;

export interface CustomNetworksState {
  customChains: Chain[];
  customNetworks: BackendNetworksResponse<true>;
}
export const useCustomNetworksStore = createQueryStore<
  BackendNetworksResponse<true>,
  never,
  CustomNetworksState
>(
  {
    fetcher: () => fetchNetworks<true>(CUSTOM_NETWORKS_QUERY),
    setData: ({ data, set }) => {
      set((state) => {
        if (isEqual(state.customNetworks, data)) return state;

        return {
          customChains: transformBackendNetworksToChains<true>(data.networks),
          customNetworks: data,
        };
      });
    },
    staleTime: 10 * 60 * 1_000,
  },

  (_, get) => ({
    customChains: transformBackendNetworksToChains(
        INITIAL_CUSTOM_NETWORKS.customNetworks.map(transformCustomNetworkToBackendNetwork),
    ),
    customNetworks: {
        networks: INITIAL_CUSTOM_NETWORKS.customNetworks.map(transformCustomNetworkToBackendNetwork),
    },
  }),
  {
    partialize: (state) => ({
      customChains: state.customChains,
      customNetworks: state.customNetworks,
    }),
    storageKey: 'customNetworks',
  },
);
