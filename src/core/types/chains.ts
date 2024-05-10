import {
  Chain,
  arbitrumNova,
  arbitrumSepolia,
  baseSepolia,
  celo,
  holesky,
  optimismSepolia,
  polygonZkEvm,
  scroll,
  sepolia,
} from 'viem/chains';
import * as chains from 'viem/chains';

const HARDHAT_CHAIN_ID = 1337;
const BLAST_CHAIN_ID = 81457;
const BLAST_SEPOLIA_CHAIN_ID = 168587773;
const POLYGON_AMOY_CHAIN_ID = 80002;

const HARDHAT_OP_CHAIN_ID = 1338;

export const chainHardhat: Chain = {
  id: HARDHAT_CHAIN_ID,
  name: 'Hardhat',
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

export const chainBlast: Chain = {
  id: BLAST_CHAIN_ID,
  name: 'Blast',
  rpcUrls: {
    public: { http: [process.env.BLAST_MAINNET_RPC as string] },
    default: {
      http: [process.env.BLAST_MAINNET_RPC as string],
    },
  },
  blockExplorers: {
    default: { name: 'Blastscan', url: 'https://blastscan.io/' },
  },
  nativeCurrency: {
    name: 'Blast',
    symbol: 'BLAST',
    decimals: 18,
  },
};

export const chainBlastSepolia: Chain = {
  id: BLAST_SEPOLIA_CHAIN_ID,
  name: 'Blast Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.blast.io'] },
    default: { http: ['https://sepolia.blast.io'] },
  },
  testnet: true,
};

export const chainPolygonAmoy: Chain = {
  id: POLYGON_AMOY_CHAIN_ID,
  name: 'Polygon Amoy',
  nativeCurrency: {
    decimals: 18,
    name: 'MATIC',
    symbol: 'MATIC',
  },
  rpcUrls: {
    public: { http: ['https://rpc-amoy.polygon.technology'] },
    default: { http: ['https://rpc-amoy.polygon.technology'] },
  },
  testnet: true,
};

export const chainDegen: Chain = {
  id: 666666666,
  name: 'Degen Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'Degen',
    symbol: 'DEGEN',
  },
  rpcUrls: {
    public: { http: ['https://rpc.degen.tips'] },
    default: { http: ['https://rpc.degen.tips'] },
  },
  blockExplorers: {
    default: { name: 'Degen Explorer', url: 'https://explorer.degen.tips/' },
  },
  testnet: false,
};

export enum ChainName {
  arbitrum = 'arbitrum',
  arbitrumNova = 'arbitrum-nova',
  arbitrumSepolia = 'arbitrum-sepolia',
  avalanche = 'avalanche',
  avalancheFuji = 'avalanche-fuji',
  base = 'base',
  blast = 'blast',
  blastSepolia = 'blast-sepolia',
  bsc = 'bsc',
  celo = 'celo',
  degen = 'degen',
  gnosis = 'gnosis',
  linea = 'linea',
  manta = 'manta',
  optimism = 'optimism',
  polygon = 'polygon',
  polygonZkEvm = 'polygon-zkevm',
  rari = 'rari',
  scroll = 'scroll',
  zora = 'zora',
  mainnet = 'mainnet',
  holesky = 'holesky',
  hardhat = 'hardhat',
  hardhatOptimism = 'hardhat-optimism',
  sepolia = 'sepolia',
  optimismSepolia = 'optimism-sepolia',
  bscTestnet = 'bsc-testnet',
  baseSepolia = 'base-sepolia',
  zoraSepolia = 'zora-sepolia',
  polygonAmoy = 'polygon-amoy',
}

export enum ChainId {
  arbitrum = chains.arbitrum.id,
  arbitrumNova = chains.arbitrumNova.id,
  avalanche = chains.avalanche.id,
  avalancheFuji = chains.avalancheFuji.id,
  base = chains.base.id,
  blast = chains.blast.id,
  blastSepolia = chains.blastSepolia.id,
  bsc = chains.bsc.id,
  celo = chains.celo.id,
  gnosis = chains.gnosis.id,
  linea = chains.linea.id,
  manta = chains.manta.id,
  optimism = chains.optimism.id,
  mainnet = chains.mainnet.id,
  polygon = chains.polygon.id,
  polygonZkEvm = chains.polygonZkEvm.id,
  rari = 1380012617,
  zora = chains.zora.id,
  hardhat = chains.hardhat.id,
  hardhatOptimism = chainHardhatOptimism.id,
  sepolia = chains.sepolia.id,
  scroll = chains.scroll.id,
  holesky = chains.holesky.id,
  optimismSepolia = chains.optimismSepolia.id,
  bscTestnet = chains.bscTestnet.id,
  arbitrumSepolia = chains.arbitrumSepolia.id,
  baseSepolia = chains.baseSepolia.id,
  zoraSepolia = chains.zoraSepolia.id,
  polygonAmoy = chains.polygonAmoy.id,
  degen = chains.degen.id,
}

export const chainNameToIdMapping: {
  [key in ChainName | 'ethereum' | 'ethereum-sepolia']: ChainId;
} = {
  ['ethereum']: ChainId.mainnet,
  [ChainName.arbitrum]: ChainId.arbitrum,
  [ChainName.arbitrumNova]: ChainId.arbitrumNova,
  [ChainName.arbitrumSepolia]: ChainId.arbitrumSepolia,
  [ChainName.avalanche]: ChainId.avalanche,
  [ChainName.avalancheFuji]: ChainId.avalancheFuji,
  [ChainName.base]: ChainId.base,
  [ChainName.bsc]: ChainId.bsc,
  [ChainName.celo]: ChainId.celo,
  [ChainName.gnosis]: ChainId.gnosis,
  [ChainName.linea]: ChainId.linea,
  [ChainName.manta]: ChainId.manta,
  [ChainName.optimism]: ChainId.optimism,
  [ChainName.polygon]: ChainId.polygon,
  [ChainName.polygonZkEvm]: ChainId.polygonZkEvm,
  [ChainName.rari]: ChainId.rari,
  [ChainName.scroll]: ChainId.scroll,
  [ChainName.zora]: ChainId.zora,
  [ChainName.mainnet]: ChainId.mainnet,
  [ChainName.holesky]: ChainId.holesky,
  [ChainName.hardhat]: ChainId.hardhat,
  [ChainName.hardhatOptimism]: ChainId.hardhatOptimism,
  ['ethereum-sepolia']: ChainId.sepolia,
  [ChainName.sepolia]: ChainId.sepolia,
  [ChainName.optimismSepolia]: ChainId.optimismSepolia,
  [ChainName.bscTestnet]: ChainId.bscTestnet,
  [ChainName.baseSepolia]: ChainId.baseSepolia,
  [ChainName.zoraSepolia]: ChainId.zoraSepolia,
  [ChainName.blast]: ChainId.blast,
  [ChainName.blastSepolia]: ChainId.blastSepolia,
  [ChainName.polygonAmoy]: ChainId.polygonAmoy,
  [ChainName.degen]: ChainId.degen,
};

export const chainIdToNameMapping: {
  [key in ChainId]: ChainName;
} = {
  [ChainId.arbitrum]: ChainName.arbitrum,
  [ChainId.arbitrumNova]: ChainName.arbitrumNova,
  [ChainId.arbitrumSepolia]: ChainName.arbitrumSepolia,
  [ChainId.avalanche]: ChainName.avalanche,
  [ChainId.avalancheFuji]: ChainName.avalancheFuji,
  [ChainId.base]: ChainName.base,
  [ChainId.blast]: ChainName.blast,
  [ChainId.blastSepolia]: ChainName.blastSepolia,
  [ChainId.bsc]: ChainName.bsc,
  [ChainId.celo]: ChainName.celo,
  [ChainId.gnosis]: ChainName.gnosis,
  [ChainId.linea]: ChainName.linea,
  [ChainId.manta]: ChainName.manta,
  [ChainId.optimism]: ChainName.optimism,
  [ChainId.polygon]: ChainName.polygon,
  [ChainId.polygonZkEvm]: ChainName.polygonZkEvm,
  [ChainId.rari]: ChainName.rari,
  [ChainId.scroll]: ChainName.scroll,
  [ChainId.zora]: ChainName.zora,
  [ChainId.mainnet]: ChainName.mainnet,
  [ChainId.holesky]: ChainName.holesky,
  [ChainId.hardhat]: ChainName.hardhat,
  [ChainId.hardhatOptimism]: ChainName.hardhatOptimism,
  [ChainId.sepolia]: ChainName.sepolia,
  [ChainId.optimismSepolia]: ChainName.optimismSepolia,
  [ChainId.bscTestnet]: ChainName.bscTestnet,
  [ChainId.baseSepolia]: ChainName.baseSepolia,
  [ChainId.zoraSepolia]: ChainName.zoraSepolia,
  [ChainId.polygonAmoy]: ChainName.polygonAmoy,
  [ChainId.degen]: ChainName.degen,
};

export const ChainNameDisplay = {
  [ChainId.arbitrum]: 'Arbitrum',
  [ChainId.arbitrumNova]: arbitrumNova.name,
  [ChainId.avalanche]: 'Avalanche',
  [ChainId.avalancheFuji]: 'Avalanche Fuji',
  [ChainId.base]: 'Base',
  [ChainId.blast]: 'Blast',
  [ChainId.blastSepolia]: 'Blast Sepolia',
  [ChainId.bsc]: 'BSC',
  [ChainId.celo]: celo.name,
  [ChainId.linea]: 'Linea',
  [ChainId.manta]: 'Manta',
  [ChainId.optimism]: 'Optimism',
  [ChainId.polygon]: 'Polygon',
  [ChainId.polygonZkEvm]: polygonZkEvm.name,
  [ChainId.rari]: 'RARI Chain',
  [ChainId.scroll]: scroll.name,
  [ChainId.zora]: 'Zora',
  [ChainId.mainnet]: 'Ethereum',
  [ChainId.hardhat]: 'Hardhat',
  [ChainId.hardhatOptimism]: chainHardhatOptimism.name,
  [ChainId.sepolia]: sepolia.name,
  [ChainId.holesky]: holesky.name,
  [ChainId.optimismSepolia]: optimismSepolia.name,
  [ChainId.bscTestnet]: 'BSC Testnet',
  [ChainId.arbitrumSepolia]: arbitrumSepolia.name,
  [ChainId.baseSepolia]: baseSepolia.name,
  [ChainId.zoraSepolia]: 'Zora Sepolia',
  [ChainId.polygonAmoy]: 'Polygon Amoy',
  [ChainId.degen]: 'Degen',
} as const;
