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
  polygonMumbai,
  zora,
  zoraSepolia,
} from 'viem/chains';
import { Chain, goerli, mainnet, sepolia } from 'wagmi';

import { ChainId, ChainNameDisplay } from '../types/chains';

import {
  getSupportedChainsWithHardhat,
  getSupportedTestnetChains,
} from './chains';

export const chainIdMap: Record<
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.polygon
  | ChainId.base
  | ChainId.bsc
  | ChainId.zora
  | ChainId.avalanche,
  ChainId[]
> = {
  [ChainId.mainnet]: [mainnet.id, goerli.id, sepolia.id, holesky.id],
  [ChainId.optimism]: [optimism.id, optimismSepolia.id],
  [ChainId.arbitrum]: [arbitrum.id, arbitrumSepolia.id],
  [ChainId.polygon]: [polygon.id, polygonMumbai.id],
  [ChainId.base]: [base.id, baseSepolia.id],
  [ChainId.bsc]: [bsc.id, bscTestnet.id],
  [ChainId.zora]: [zora.id, zoraSepolia.id],
  [ChainId.avalanche]: [avalanche.id, avalancheFuji.id],
};

export const chainLabelMap: Record<
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.polygon
  | ChainId.base
  | ChainId.bsc
  | ChainId.zora
  | ChainId.avalanche,
  string[]
> = {
  [ChainId.mainnet]: [
    ChainNameDisplay[goerli.id],
    ChainNameDisplay[sepolia.id],
    ChainNameDisplay[holesky.id],
  ],
  [ChainId.optimism]: [ChainNameDisplay[optimismSepolia.id]],
  [ChainId.arbitrum]: [ChainNameDisplay[arbitrumSepolia.id]],
  [ChainId.polygon]: [ChainNameDisplay[polygonMumbai.id]],
  [ChainId.base]: [ChainNameDisplay[baseSepolia.id]],
  [ChainId.bsc]: [ChainNameDisplay[bscTestnet.id]],
  [ChainId.zora]: [ChainNameDisplay[zoraSepolia.id]],
  [ChainId.avalanche]: [ChainNameDisplay[avalancheFuji.id]],
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
