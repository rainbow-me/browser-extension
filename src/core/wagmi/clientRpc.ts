import { Chain } from 'viem';

import { proxyRpcEndpoint } from '../providers';
import { connectedToHardhatStore } from '../state/currentSettings/connectedToHardhat';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { findRainbowChainForChainId } from '../utils/rainbowChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const getOriginalRpcEndpoint = (chain: Chain) => {
  const userAddedNetwork = findRainbowChainForChainId(chain.id);
  if (userAddedNetwork) {
    return userAddedNetwork.rpcUrls.default.http[0];
  }
  return chain.rpcUrls.default.http[0];
};

export const handleRpcUrl = (chain: Chain) => {
  if (
    (IS_TESTING &&
      ((chain.id === ChainId.mainnet &&
        connectedToHardhatStore.getState().connectedToHardhat) ||
        (chain.id === ChainId.optimism &&
          connectedToHardhatStore.getState().connectedToHardhatOp))) ||
    chain.id === chainHardhat.id ||
    chain.id === chainHardhatOptimism.id
  ) {
    return chainHardhat.rpcUrls.default.http[0];
  } else {
    return proxyRpcEndpoint(getOriginalRpcEndpoint(chain), chain.id);
  }
};
