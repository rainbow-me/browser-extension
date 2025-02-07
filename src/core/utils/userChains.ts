import { type Chain } from 'viem/chains';
import { ChainId } from '../types/chains';

import { getSupportedChains } from './chains';
import { networkStore } from '../state/networks/networks';

export const sortNetworks = (order: number[], chains: Chain[]) => {
  const chainIdsBasedOnMainnetId = networkStore.getState().getChainIdsBasedOnMainnetId();
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

export const filterUserNetworks = ({
  testnetMode,
  userChains,
  userChainsOrder,
}: {
  testnetMode: boolean;
  userChains: Record<ChainId, boolean>;
  userChainsOrder: ChainId[];
}) => {
  const chainIdsBasedOnMainnetId = networkStore.getState().getChainIdsBasedOnMainnetId();
  const supportedChains: Chain[] = getSupportedChains({
    testnets: testnetMode,
  });

  const availableChains = Object.keys(userChains)
    .filter((chainId) => userChains[Number(chainId)] === true)
    .map((chainId) => Number(chainId));

  const allAvailableUserChains = availableChains
    .map((chainId) => chainIdsBasedOnMainnetId[chainId])
    .flat();

  const chains = supportedChains.filter((chain) =>
    allAvailableUserChains.includes(chain.id),
  );

  return sortNetworks(userChainsOrder, chains);
};
