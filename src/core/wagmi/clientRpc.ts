import { Chain } from 'viem';

import { proxyRpcEndpoint } from '../providers/proxy';
import { connectedToHardhatStore } from '../state/currentSettings/connectedToHardhat';
import { networkStore } from '../state/networks/networks';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';

const IS_TESTING = process.env.IS_TESTING === 'true';

const getOriginalRpcEndpoint = (chain: Chain) => {
  const userAddedChain = networkStore.getState().getActiveRpcForChain(chain.id);
  if (userAddedChain) {
    return userAddedChain.rpcUrls.default.http[0];
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
