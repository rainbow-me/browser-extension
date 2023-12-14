import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { Chain } from '@wagmi/core';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc';
import {
  CreateClientConfig,
  configureChains,
  createClient,
  createStorage,
} from 'wagmi';

import { proxyRpcEndpoint } from '../providers';
import { queryClient } from '../react-query';
import { SUPPORTED_CHAINS, getDefaultRPC } from '../references';
import { LocalStorage } from '../storage';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { findCustomChainForChainId } from '../utils/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const noopStorage = {
  getItem: () => '',
  setItem: () => null,
  removeItem: () => null,
};

export const getOriginalRpcEndpoint = (chain: Chain) => {
  // overrides have preference
  const userAddedNetwork = findCustomChainForChainId(chain.id);
  if (userAddedNetwork) {
    return { http: userAddedNetwork.rpcUrls.default.http[0] };
  }
  if (chain.id === ChainId.hardhat || chain.id === ChainId.hardhatOptimism) {
    return { http: chain.rpcUrls.default.http[0] };
  }

  return getDefaultRPC(chain.id);
};

const supportedChains = IS_TESTING
  ? SUPPORTED_CHAINS.concat(chainHardhat, chainHardhatOptimism)
  : SUPPORTED_CHAINS;

export const configureChainsForWagmiClient = (
  chains: Chain[],
  useProxy?: boolean,
) =>
  configureChains(chains, [
    jsonRpcProvider({
      rpc: (chain) => {
        const originalRpcEndpoint = getOriginalRpcEndpoint(chain);
        if (originalRpcEndpoint) {
          return {
            http: useProxy
              ? proxyRpcEndpoint(originalRpcEndpoint.http, chain.id)
              : originalRpcEndpoint.http,
          };
        }
        return null;
      },
    }),
  ]);

const asyncStoragePersister = createAsyncStoragePersister({
  key: 'rainbow.wagmi',
  storage: {
    getItem: LocalStorage.get,
    setItem: LocalStorage.set,
    removeItem: LocalStorage.remove,
  },
});

export function createWagmiClient({
  autoConnect,
  connectors,
  persist,
  customChains,
  useProxy,
}: {
  autoConnect?: CreateClientConfig['autoConnect'];
  connectors?: (opts: { chains: Chain[] }) => CreateClientConfig['connectors'];
  persist?: boolean;
  customChains?: Chain[];
  useProxy?: boolean;
} = {}) {
  const customChainIds = customChains?.map((chain) => chain.id);
  const activeSupportedChains = supportedChains?.filter(
    (supportedChain) => !customChainIds?.includes(supportedChain.id),
  );
  const { chains, provider, webSocketProvider } = configureChainsForWagmiClient(
    activeSupportedChains.concat(customChains || []),
    useProxy,
  );

  return createClient({
    autoConnect,
    connectors: connectors
      ? connectors({
          chains,
        })
      : undefined,
    persister: persist ? asyncStoragePersister : undefined,
    provider,
    // Passing `undefined` will use wagmi's default storage (window.localStorage).
    // If `persist` is falsy, we want to pass through a noopStorage.
    storage: persist ? undefined : createStorage({ storage: noopStorage }),
    queryClient,
    webSocketProvider,
  });
}
