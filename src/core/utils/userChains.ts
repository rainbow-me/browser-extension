import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  holesky,
  optimism,
  optimismSepolia,
  polygon,
  zora,
  zoraSepolia,
} from 'viem/chains';
import { Chain, mainnet, sepolia } from 'wagmi';

import {
  ChainId,
  ChainNameDisplay,
  chainBlast,
  chainBlastSepolia,
  chainPolygonAmoy,
} from '../types/chains';

import {
  getSupportedChainsWithHardhat,
  getSupportedTestnetChains,
} from './chains';

export const chainIdMap: Record<
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.arbitrum
  | ChainId.polygon
  | ChainId.base
  | ChainId.bsc
  | ChainId.zora
  | ChainId.avalanche
  | ChainId.blast,
  ChainId[]
> = {
  [ChainId.mainnet]: [mainnet.id, sepolia.id, holesky.id],
  [ChainId.optimism]: [optimism.id, optimismSepolia.id],
  [ChainId.arbitrum]: [arbitrum.id, arbitrumSepolia.id],
  [ChainId.polygon]: [polygon.id, chainPolygonAmoy.id],
  [ChainId.base]: [base.id, baseSepolia.id],
  [ChainId.bsc]: [bsc.id, bscTestnet.id],
  [ChainId.zora]: [zora.id, zoraSepolia.id],
  [ChainId.avalanche]: [avalanche.id, avalancheFuji.id],
  [ChainId.blast]: [chainBlast.id, chainBlastSepolia.id],
};

export const chainLabelMap: Record<
  | ChainId.arbitrum
  | ChainId.avalanche
  | ChainId.base
  | ChainId.blast
  | ChainId.bsc
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.polygon
  | ChainId.zora,
  string[]
> = {
  [ChainId.arbitrum]: [ChainNameDisplay[arbitrumSepolia.id]],
  [ChainId.avalanche]: [ChainNameDisplay[avalancheFuji.id]],
  [ChainId.base]: [ChainNameDisplay[baseSepolia.id]],
  [ChainId.blast]: [ChainNameDisplay[chainBlastSepolia.id]],
  [ChainId.bsc]: [ChainNameDisplay[bscTestnet.id]],
  [ChainId.mainnet]: [
    ChainNameDisplay[sepolia.id],
    ChainNameDisplay[holesky.id],
  ],
  [ChainId.optimism]: [ChainNameDisplay[optimismSepolia.id]],
  [ChainId.polygon]: [ChainNameDisplay[chainPolygonAmoy.id]],
  [ChainId.zora]: [ChainNameDisplay[zoraSepolia.id]],
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
  testnetMode,
  userChains,
  userChainsOrder,
}: {
  testnetMode: boolean;
  userChains: Record<ChainId, boolean>;
  userChainsOrder: ChainId[];
}) => {
  const supportedChains = testnetMode
    ? getSupportedTestnetChains()
    : getSupportedChainsWithHardhat();

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
