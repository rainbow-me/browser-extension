import * as chain from 'viem/chains';
import type { Chain } from 'wagmi';

const HARDHAT_CHAIN_ID = 1337;
const HARDHAT_OP_CHAIN_ID = 1338;

export const chainHardhat: Chain = {
  id: HARDHAT_CHAIN_ID,
  name: 'Hardhat',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Hardhat',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

export const chainHardhatOptimism: Chain = {
  id: HARDHAT_OP_CHAIN_ID,
  name: 'Hardhat OP',
  network: 'hardhat-optimism',
  nativeCurrency: {
    decimals: 18,
    name: 'Hardhat OP',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['http://127.0.0.1:8545'] },
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

export enum ChainName {
  arbitrum = 'arbitrum',
  arbitrumNova = 'arbitrum-nova',
  arbitrumSepolia = 'arbitrum-sepolia',
  avalanche = 'avalanche',
  base = 'base',
  bsc = 'bsc',
  celo = 'celo',
  gnosis = 'gnosis',
  linea = 'linea',
  manta = 'manta',
  optimism = 'optimism',
  polygon = 'polygon',
  polygonZkEvm = 'polygon-zkevm',
  scroll = 'scroll',
  zora = 'zora',
  mainnet = 'mainnet',
  holesky = 'holesky',
  hardhat = 'hardhat',
  hardhatOptimism = 'hardhat-optimism',
  goerli = 'goerli',
  sepolia = 'sepolia',
  optimismGoerli = 'optimism-goerli',
  optimismSepolia = 'optimism-sepolia',
  bscTestnet = 'bsc-testnet',
  polygonMumbai = 'polygon-mumbai',
  arbitrumGoerli = 'arbitrum-goerli',
  baseGoerli = 'base-goerli',
  baseSepolia = 'base-sepolia',
  zoraTestnet = 'zora-testnet',
  zoraSepolia = 'zora-sepolia',
}

export enum ChainId {
  arbitrum = chain.arbitrum.id,
  arbitrumNova = chain.arbitrumNova.id,
  avalanche = chain.avalanche.id,
  base = chain.base.id,
  bsc = chain.bsc.id,
  celo = chain.celo.id,
  gnosis = chain.gnosis.id,
  linea = chain.linea.id,
  manta = chain.manta.id,
  optimism = chain.optimism.id,
  mainnet = chain.mainnet.id,
  polygon = chain.polygon.id,
  polygonZkEvm = chain.polygonZkEvm.id,
  zora = chain.zora.id,
  hardhat = HARDHAT_CHAIN_ID,
  hardhatOptimism = chainHardhatOptimism.id,
  goerli = chain.goerli.id,
  sepolia = chain.sepolia.id,
  scroll = chain.scroll.id,
  holesky = chain.holesky.id,
  optimismGoerli = chain.optimismGoerli.id,
  optimismSepolia = chain.optimismSepolia.id,
  bscTestnet = chain.bscTestnet.id,
  polygonMumbai = chain.polygonMumbai.id,
  arbitrumGoerli = chain.arbitrumGoerli.id,
  arbitrumSepolia = chain.arbitrumSepolia.id,
  baseGoerli = chain.baseGoerli.id,
  baseSepolia = chain.baseSepolia.id,
  zoraTestnet = chain.zoraTestnet.id,
  zoraSepolia = chain.zoraSepolia.id,
}

export const chainNameToIdMapping: {
  [key in ChainName]: ChainId;
} = {
  [ChainName.arbitrum]: ChainId.arbitrum,
  [ChainName.arbitrumNova]: ChainId.arbitrumNova,
  [ChainName.arbitrumSepolia]: ChainId.arbitrumSepolia,
  [ChainName.avalanche]: ChainId.avalanche,
  [ChainName.base]: ChainId.base,
  [ChainName.bsc]: ChainId.bsc,
  [ChainName.celo]: ChainId.celo,
  [ChainName.gnosis]: ChainId.gnosis,
  [ChainName.linea]: ChainId.linea,
  [ChainName.manta]: ChainId.manta,
  [ChainName.optimism]: ChainId.optimism,
  [ChainName.polygon]: ChainId.polygon,
  [ChainName.polygonZkEvm]: ChainId.polygonZkEvm,
  [ChainName.scroll]: ChainId.scroll,
  [ChainName.zora]: ChainId.zora,
  [ChainName.mainnet]: ChainId.mainnet,
  [ChainName.holesky]: ChainId.holesky,
  [ChainName.hardhat]: ChainId.hardhat,
  [ChainName.hardhatOptimism]: ChainId.hardhatOptimism,
  [ChainName.goerli]: ChainId.goerli,
  [ChainName.sepolia]: ChainId.sepolia,
  [ChainName.optimismGoerli]: ChainId.optimismGoerli,
  [ChainName.optimismSepolia]: ChainId.optimismSepolia,
  [ChainName.bscTestnet]: ChainId.bscTestnet,
  [ChainName.polygonMumbai]: ChainId.polygonMumbai,
  [ChainName.arbitrumGoerli]: ChainId.arbitrumGoerli,
  [ChainName.baseGoerli]: ChainId.baseGoerli,
  [ChainName.baseSepolia]: ChainId.baseSepolia,
  [ChainName.zoraTestnet]: ChainId.zoraTestnet,
  [ChainName.zoraSepolia]: ChainId.zoraSepolia,
};

export const chainIdToNameMapping = Object.entries(chainNameToIdMapping).reduce(
  (res, [key, value]) => {
    res[value as ChainId] = key as ChainName;
    return res;
  },
  {} as Record<ChainId, ChainName>,
) as { [key in ChainId]: ChainName };

export const ChainNameDisplay = {
  [ChainId.arbitrum]: 'Arbitrum',
  [ChainId.arbitrumNova]: chain.arbitrumNova.name,
  [ChainId.avalanche]: chain.avalanche.name,
  [ChainId.base]: 'Base',
  [ChainId.bsc]: 'BSC',
  [ChainId.celo]: chain.celo.name,
  [ChainId.linea]: 'Linea',
  [ChainId.manta]: 'Manta',
  [ChainId.optimism]: 'Optimism',
  [ChainId.polygon]: 'Polygon',
  [ChainId.polygonZkEvm]: chain.polygonZkEvm.name,
  [ChainId.scroll]: chain.scroll.name,
  [ChainId.zora]: 'Zora',
  [ChainId.mainnet]: 'Ethereum',
  [ChainId.hardhat]: 'Hardhat',
  [ChainId.hardhatOptimism]: chainHardhatOptimism.name,
  [ChainId.goerli]: chain.goerli.name,
  [ChainId.sepolia]: chain.sepolia.name,
  [ChainId.holesky]: chain.holesky.name,
  [ChainId.optimismGoerli]: chain.optimismGoerli.name,
  [ChainId.optimismSepolia]: chain.optimismSepolia.name,
  [ChainId.bscTestnet]: 'BSC Testnet',
  [ChainId.polygonMumbai]: chain.polygonMumbai.name,
  [ChainId.arbitrumGoerli]: chain.arbitrumGoerli.name,
  [ChainId.arbitrumSepolia]: chain.arbitrumSepolia.name,
  [ChainId.baseGoerli]: chain.baseGoerli.name,
  [ChainId.baseSepolia]: chain.baseSepolia.name,
  [ChainId.zoraTestnet]: 'Zora Goerli',
  [ChainId.zoraSepolia]: 'Zora Sepolia',
} as const;
