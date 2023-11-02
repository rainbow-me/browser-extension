// This is to simulate the user adding custom RPC endpoints that we'll be storing in state

import { userAddedCustomRpcEndpoints } from '../references';

import { SUPPORTED_CHAINS } from './chains';

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
