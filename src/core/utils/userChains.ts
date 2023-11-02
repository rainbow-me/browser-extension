import {
  arbitrum,
  arbitrumGoerli,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  zora,
  zoraTestnet,
} from '@wagmi/chains';
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
  | ChainId.zora,
  ChainId[]
> = {
  [ChainId.mainnet]: [mainnet.id, goerli.id, sepolia.id],
  [ChainId.optimism]: [optimism.id, optimismGoerli.id],
  [ChainId.arbitrum]: [arbitrum.id, arbitrumGoerli.id],
  [ChainId.polygon]: [polygon.id, polygonMumbai.id],
  [ChainId.base]: [base.id, baseGoerli.id],
  [ChainId.bsc]: [bsc.id, bscTestnet.id],
  [ChainId.zora]: [zora.id, zoraTestnet.id],
};

export const chainLabelMap: Record<
  | ChainId.mainnet
  | ChainId.optimism
  | ChainId.polygon
  | ChainId.base
  | ChainId.bsc
  | ChainId.zora,
  string[]
> = {
  [ChainId.mainnet]: [
    ChainNameDisplay[goerli.id],
    ChainNameDisplay[sepolia.id],
  ],
  [ChainId.optimism]: [ChainNameDisplay[optimismGoerli.id]],
  [ChainId.arbitrum]: [ChainNameDisplay[arbitrumGoerli.id]],
  [ChainId.polygon]: [ChainNameDisplay[polygonMumbai.id]],
  [ChainId.base]: [ChainNameDisplay[baseGoerli.id]],
  [ChainId.bsc]: [ChainNameDisplay[bscTestnet.id]],
  [ChainId.zora]: [ChainNameDisplay[zoraTestnet.id]],
};

export const sortNetworks = (order: ChainId[], chains: Chain[]) => {
  const allChainsOrder = order.map((chainId) => chainIdMap[chainId]).flat();
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
