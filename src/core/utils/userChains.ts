import { type Chain } from 'viem/chains';

import { networkStore } from '../state/networks/networks';

export const sortNetworks = (order: number[], chains: Chain[]) => {
  const chainIdsBasedOnMainnetId = networkStore
    .getState()
    .getBackendChainIdsByMainnetId();
  const allChainsOrder = order
    ?.map((chainId) => chainIdsBasedOnMainnetId[chainId] || [chainId])
    ?.flat();
  const ordered = chains.sort((a, b) => {
    const aIndex = allChainsOrder.indexOf(a.id);
    const bIndex = allChainsOrder.indexOf(b.id);
    if (aIndex === -1) return bIndex === -1 ? 0 : 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  return ordered;
};
