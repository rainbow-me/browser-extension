import {
  Chain,
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  bsc,
  bscTestnet,
  curtis,
  degen,
  holesky,
  inkSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
  zora,
  zoraSepolia,
} from 'viem/chains';

import { useBackendNetworksStore } from '~/core/state/backendNetworks/backendNetworks';

import { ChainId } from '../types/chains';

// TODO: Need to figure out what to do with these mappings
// Should default order come from the backend?
export const chainIdMap: Record<
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.arbitrum
  | ChainId.polygon
  | ChainId.base
  | ChainId.bsc
  | ChainId.zora
  | ChainId.avalanche
  | ChainId.blast
  | ChainId.degen
  | ChainId.apechain
  | ChainId.ink,
  ChainId[]
> = {
  [ChainId.mainnet]: [mainnet.id, sepolia.id, holesky.id],
  [ChainId.optimism]: [optimism.id, optimismSepolia.id],
  [ChainId.arbitrum]: [arbitrum.id, arbitrumSepolia.id],
  [ChainId.polygon]: [polygon.id, polygonAmoy.id],
  [ChainId.base]: [base.id, baseSepolia.id],
  [ChainId.bsc]: [bsc.id, bscTestnet.id],
  [ChainId.zora]: [zora.id, zoraSepolia.id],
  [ChainId.avalanche]: [avalanche.id, avalancheFuji.id],
  [ChainId.blast]: [blast.id, blastSepolia.id],
  [ChainId.degen]: [degen.id],
  [ChainId.apechain]: [ChainId.apechain, curtis.id],
  [ChainId.ink]: [ChainId.ink, inkSepolia.id],
};

// FIXME: This is a temporary solution to get the chain labels to not throw a lint error
export const chainLabelMap: Record<
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.polygon
  | ChainId.base
  | ChainId.bsc
  | ChainId.zora
  | ChainId.avalanche
  | ChainId.blast
  | ChainId.degen
  | ChainId.apechain
  | ChainId.ink,
  string[]
> = {
  [ChainId.mainnet]: [
    useBackendNetworksStore.getState().getChainsLabel()[sepolia.id],
    useBackendNetworksStore.getState().getChainsLabel()[holesky.id],
  ],
  [ChainId.optimism]: [
    useBackendNetworksStore.getState().getChainsLabel()[optimismSepolia.id],
  ],
  [ChainId.arbitrum]: [
    useBackendNetworksStore.getState().getChainsLabel()[arbitrumSepolia.id],
  ],
  [ChainId.polygon]: [
    useBackendNetworksStore.getState().getChainsLabel()[polygonAmoy.id],
  ],
  [ChainId.base]: [
    useBackendNetworksStore.getState().getChainsLabel()[baseSepolia.id],
  ],
  [ChainId.bsc]: [
    useBackendNetworksStore.getState().getChainsLabel()[bscTestnet.id],
  ],
  [ChainId.zora]: [
    useBackendNetworksStore.getState().getChainsLabel()[zoraSepolia.id],
  ],
  [ChainId.avalanche]: [
    useBackendNetworksStore.getState().getChainsLabel()[avalancheFuji.id],
  ],
  [ChainId.blast]: [
    useBackendNetworksStore.getState().getChainsLabel()[blastSepolia.id],
  ],
  [ChainId.degen]: [],
  [ChainId.apechain]: [
    useBackendNetworksStore.getState().getChainsLabel()[curtis.id],
  ],
  [ChainId.ink]: [
    useBackendNetworksStore.getState().getChainsLabel()[inkSepolia.id],
  ],
};

export const sortNetworks = (order: ChainId[], chains: Chain[]) => {
  const allChainsOrder = order
    ?.map((chainId) => chainIdMap[chainId] || [chainId])
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
  userChains,
  userChainsOrder,
}: {
  userChains: Record<ChainId, boolean>;
  userChainsOrder: ChainId[];
}) => {
  const supportedChains = useBackendNetworksStore
    .getState()
    .getSupportedChains();

  const availableChains = Object.keys(userChains)
    .filter((chainId) => userChains[Number(chainId)] === true)
    .map((chainId) => Number(chainId));

  const allAvailableUserChains = availableChains
    .map((chainId) => chainIdMap[chainId])
    .flat();

  const chains = supportedChains.filter((chain) =>
    allAvailableUserChains.includes(chain.id),
  );

  return sortNetworks(userChainsOrder, chains);
};
