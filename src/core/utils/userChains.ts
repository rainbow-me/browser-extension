import {
  Chain,
  apeChain,
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

import { networkStore } from '~/core/state/networks/networks';

import { ChainId } from '../types/chains';

const labels = networkStore.getState().getChainsLabel();

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
  | ChainId.ink
  | ChainId.sanko
  | ChainId.gravity,
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
  [ChainId.apechain]: [apeChain.id, curtis.id],
  [ChainId.ink]: [ChainId.ink, inkSepolia.id],
  [ChainId.sanko]: [ChainId.sanko, ChainId.sankoTestnet],
  [ChainId.gravity]: [ChainId.gravity, ChainId.gravitySepolia],
};

// Used to display the chain label in the settings networks page
// Only need to include testnets as 'Mainnet' is always pre-pended
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
  | ChainId.ink
  | ChainId.sanko
  | ChainId.gravity,
  string[]
> = {
  [ChainId.mainnet]: [labels[sepolia.id], labels[holesky.id]],
  [ChainId.optimism]: [labels[optimismSepolia.id]],
  [ChainId.arbitrum]: [labels[arbitrumSepolia.id]],
  [ChainId.polygon]: [labels[polygonAmoy.id]],
  [ChainId.base]: [labels[baseSepolia.id]],
  [ChainId.bsc]: [labels[bscTestnet.id]],
  [ChainId.zora]: [labels[zoraSepolia.id]],
  [ChainId.avalanche]: [labels[avalancheFuji.id]],
  [ChainId.blast]: [labels[blastSepolia.id]],
  [ChainId.degen]: [],
  [ChainId.apechain]: [labels[curtis.id]],
  [ChainId.ink]: [labels[inkSepolia.id]],
  [ChainId.sanko]: [labels[ChainId.sankoTestnet]],
  [ChainId.gravity]: [labels[ChainId.gravitySepolia]],
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
