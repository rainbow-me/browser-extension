// This is to simulate the user adding custom RPC endpoints that we'll be storing in state

import { SUPPORTED_CHAINS, userAddedCustomRpcEndpoints } from '../references';

export const findCustomNetworkForChainId = (chainId: number) => {
  return userAddedCustomRpcEndpoints.find(
    (network) => network.chainId === chainId && network.active,
  );
};

export const getCustomNetworks = () =>
  userAddedCustomRpcEndpoints.filter(
    (network) =>
      isCustomNetwork(network.chainId) &&
      SUPPORTED_CHAINS.every((chain) => chain.id !== network.chainId),
  );

export const isCustomNetwork = (chainId: number) =>
  !!findCustomNetworkForChainId(chainId);
