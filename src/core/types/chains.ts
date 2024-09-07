import { Chain } from 'viem/chains';
import * as chains from 'viem/chains';

const HARDHAT_CHAIN_ID = 1337;
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

export enum ChainName {
  arbitrum = 'arbitrum',
  arbitrumNova = 'arbitrum-nova',
  arbitrumSepolia = 'arbitrum-sepolia',
  avalanche = 'avalanche',
  avalancheFuji = 'avalanche-fuji',
  b3 = 'b3',
  base = 'base',
  baseSepolia = 'base-sepolia',
  blast = 'blast',
  blastSepolia = 'blast-sepolia',
  bsc = 'bsc',
  bscTestnet = 'bsc-testnet',
  canto = 'canto',
  celo = 'celo',
  degen = 'degen',
  fantom = 'fantom',
  forma = 'forma',
  godwoken = 'godwoken',
  gnosis = 'gnosis',
  hardhat = 'hardhat',
  hardhatOptimism = 'hardhat-optimism',
  holesky = 'holesky',
  immutableZkEvm = 'immutable-zkevm',
  linea = 'linea',
  loot = 'loot',
  mainnet = 'mainnet',
  manta = 'manta',
  mode = 'mode',
  moonbeam = 'moonbeam',
  opbnb = 'opbnb',
  optimism = 'optimism',
  optimismSepolia = 'optimism-sepolia',
  palm = 'palm',
  polygon = 'polygon',
  polygonAmoy = 'polygon-amoy',
  polygonZkEvm = 'polygon-zkevm',
  proofOfPlayApex = 'proof-of-play',
  proofOfPlayBoss = 'proof-of-play-boss',
  rari = 'rari',
  scroll = 'scroll',
  sei = 'sei',
  sepolia = 'sepolia',
  xai = 'xai',
  zksync = 'zksync-era',
  zora = 'zora',
  zoraSepolia = 'zora-sepolia',
}

export enum ChainId {
  arbitrum = chains.arbitrum.id,
  arbitrumNova = chains.arbitrumNova.id,
  arbitrumSepolia = chains.arbitrumSepolia.id,
  avalanche = chains.avalanche.id,
  avalancheFuji = chains.avalancheFuji.id,
  b3 = chains.b3.id,
  base = chains.base.id,
  baseSepolia = chains.baseSepolia.id,
  blast = chains.blast.id,
  blastSepolia = chains.blastSepolia.id,
  bsc = chains.bsc.id,
  bscTestnet = chains.bscTestnet.id,
  canto = chains.canto.id,
  celo = chains.celo.id,
  degen = chains.degen.id,
  fantom = chains.fantom.id,
  forma = chains.forma.id,
  gnosis = chains.gnosis.id,
  godwoken = 71402,
  hardhat = chainHardhat.id,
  hardhatOptimism = chainHardhatOptimism.id,
  holesky = chains.holesky.id,
  immutableZkEvm = chains.immutableZkEvm.id,
  linea = chains.linea.id,
  loot = 5151706,
  mainnet = chains.mainnet.id,
  manta = chains.manta.id,
  mode = chains.mode.id,
  moonbeam = chains.moonbeam.id,
  opbnb = 204,
  optimism = chains.optimism.id,
  optimismSepolia = chains.optimismSepolia.id,
  palm = chains.palm.id,
  polygon = chains.polygon.id,
  polygonAmoy = chains.polygonAmoy.id,
  polygonZkEvm = chains.polygonZkEvm.id,
  proofOfPlayApex = 70700,
  proofOfPlayBoss = 70701,
  rari = 1380012617,
  scroll = chains.scroll.id,
  sei = chains.sei.id,
  sepolia = chains.sepolia.id,
  xai = chains.xai.id,
  zksync = chains.zksync.id,
  zora = chains.zora.id,
  zoraSepolia = chains.zoraSepolia.id,
}

export const chainNameToIdMapping: {
  [key in ChainName | 'ethereum' | 'ethereum-sepolia']: ChainId;
} = {
  ['ethereum']: ChainId.mainnet,
  ['ethereum-sepolia']: ChainId.sepolia,
  [ChainName.arbitrum]: ChainId.arbitrum,
  [ChainName.arbitrumNova]: ChainId.arbitrumNova,
  [ChainName.arbitrumSepolia]: ChainId.arbitrumSepolia,
  [ChainName.avalanche]: ChainId.avalanche,
  [ChainName.avalancheFuji]: ChainId.avalancheFuji,
  [ChainName.b3]: ChainId.b3,
  [ChainName.base]: ChainId.base,
  [ChainName.baseSepolia]: ChainId.baseSepolia,
  [ChainName.blast]: ChainId.blast,
  [ChainName.blastSepolia]: ChainId.blastSepolia,
  [ChainName.bsc]: ChainId.bsc,
  [ChainName.bscTestnet]: ChainId.bscTestnet,
  [ChainName.canto]: ChainId.canto,
  [ChainName.celo]: ChainId.celo,
  [ChainName.degen]: ChainId.degen,
  [ChainName.fantom]: ChainId.fantom,
  [ChainName.forma]: ChainId.forma,
  [ChainName.gnosis]: ChainId.gnosis,
  [ChainName.godwoken]: ChainId.godwoken,
  [ChainName.hardhat]: ChainId.hardhat,
  [ChainName.hardhatOptimism]: ChainId.hardhatOptimism,
  [ChainName.holesky]: ChainId.holesky,
  [ChainName.immutableZkEvm]: ChainId.immutableZkEvm,
  [ChainName.linea]: ChainId.linea,
  [ChainName.loot]: ChainId.loot,
  [ChainName.mainnet]: ChainId.mainnet,
  [ChainName.manta]: ChainId.manta,
  [ChainName.mode]: ChainId.mode,
  [ChainName.moonbeam]: ChainId.moonbeam,
  [ChainName.opbnb]: ChainId.opbnb,
  [ChainName.optimism]: ChainId.optimism,
  [ChainName.optimismSepolia]: ChainId.optimismSepolia,
  [ChainName.palm]: ChainId.palm,
  [ChainName.polygon]: ChainId.polygon,
  [ChainName.polygonAmoy]: ChainId.polygonAmoy,
  [ChainName.polygonZkEvm]: ChainId.polygonZkEvm,
  [ChainName.proofOfPlayApex]: ChainId.proofOfPlayApex,
  [ChainName.proofOfPlayBoss]: ChainId.proofOfPlayBoss,
  [ChainName.rari]: ChainId.rari,
  [ChainName.scroll]: ChainId.scroll,
  [ChainName.sei]: ChainId.sei,
  [ChainName.sepolia]: ChainId.sepolia,
  [ChainName.xai]: ChainId.xai,
  [ChainName.zksync]: ChainId.zksync,
  [ChainName.zora]: ChainId.zora,
  [ChainName.zoraSepolia]: ChainId.zoraSepolia,
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
  [ChainId.baseSepolia]: ChainName.baseSepolia,
  [ChainId.blast]: ChainName.blast,
  [ChainId.blastSepolia]: ChainName.blastSepolia,
  [ChainId.bsc]: ChainName.bsc,
  [ChainId.bscTestnet]: ChainName.bscTestnet,
  [ChainId.celo]: ChainName.celo,
  [ChainId.degen]: ChainName.degen,
  [ChainId.fantom]: ChainName.fantom,
  [ChainId.forma]: ChainName.forma,
  [ChainId.gnosis]: ChainName.gnosis,
  [ChainId.godwoken]: ChainName.godwoken,
  [ChainId.hardhat]: ChainName.hardhat,
  [ChainId.hardhatOptimism]: ChainName.hardhatOptimism,
  [ChainId.holesky]: ChainName.holesky,
  [ChainId.immutableZkEvm]: ChainName.immutableZkEvm,
  [ChainId.linea]: ChainName.linea,
  [ChainId.loot]: ChainName.loot,
  [ChainId.mainnet]: ChainName.mainnet,
  [ChainId.manta]: ChainName.manta,
  [ChainId.mode]: ChainName.mode,
  [ChainId.moonbeam]: ChainName.moonbeam,
  [ChainId.opbnb]: ChainName.opbnb,
  [ChainId.optimism]: ChainName.optimism,
  [ChainId.optimismSepolia]: ChainName.optimismSepolia,
  [ChainId.palm]: ChainName.palm,
  [ChainId.polygon]: ChainName.polygon,
  [ChainId.polygonAmoy]: ChainName.polygonAmoy,
  [ChainId.polygonZkEvm]: ChainName.polygonZkEvm,
  [ChainId.proofOfPlayApex]: ChainName.proofOfPlayApex,
  [ChainId.proofOfPlayBoss]: ChainName.proofOfPlayBoss,
  [ChainId.rari]: ChainName.rari,
  [ChainId.scroll]: ChainName.scroll,
  [ChainId.sei]: ChainName.sei,
  [ChainId.sepolia]: ChainName.sepolia,
  [ChainId.xai]: ChainName.xai,
  [ChainId.zksync]: ChainName.zksync,
  [ChainId.zora]: ChainName.zora,
  [ChainId.zoraSepolia]: ChainName.zoraSepolia,
};

export interface BackendNetworkServices {
  meteorology: {
    enabled: boolean;
  };
  swap: {
    enabled: boolean;
  };
  addys: {
    approvals: boolean;
    transactions: boolean;
    assets: boolean;
    positions: boolean;
  };
  tokenSearch: {
    enabled: boolean;
  };
  nftProxy: {
    enabled: boolean;
  };
}

export interface BackendNetwork {
  id: string;
  name: string;
  label: string;
  icons: {
    badgeURL: string;
  };
  testnet: boolean;
  opStack: boolean;
  defaultExplorer: {
    url: string;
    label: string;
    transactionURL: string;
    tokenURL: string;
  };
  defaultRPC: {
    enabledDevices: string[];
    url: string;
  };
  gasUnits: {
    basic: {
      approval: string;
      swap: string;
      swapPermit: string;
      eoaTransfer: string;
      tokenTransfer: string;
    };
    wrapped: {
      wrap: string;
      unwrap: string;
    };
  };
  nativeAsset: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    iconURL: string;
    colors: {
      primary: string;
      fallback: string;
      shadow: string;
    };
  };
  nativeWrappedAsset: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    iconURL: string;
    colors: {
      primary: string;
      fallback: string;
      shadow: string;
    };
  };
  enabledServices: BackendNetworkServices;
}
