import {
  Chain,
  arbitrumNova,
  aurora,
  avalanche,
  blast,
  blastSepolia,
  boba,
  canto,
  celo,
  classic,
  cronos,
  degen,
  dogechain,
  fantom,
  filecoin,
  harmonyOne,
  immutableZkEvm,
  kava,
  klaytn,
  linea,
  manta,
  mantle,
  metis,
  mode,
  moonbeam,
  opBNB,
  palm,
  pgn,
  polygonZkEvm,
  pulsechain,
  rootstock,
  scroll,
  zkSync,
} from 'viem/chains';

import backendChains from 'static/data/chains.json';

import { ChainId, ChainName } from '../types/chains';
import { transformBackendNetworksToChains } from '../utils/backendNetworks';

export const defaultRPC: { [key in ChainId]?: string } = {
  [ChainId.mainnet]: process.env.ETH_MAINNET_RPC,
  [ChainId.optimism]: process.env.OPTIMISM_MAINNET_RPC,
  [ChainId.arbitrum]: process.env.ARBITRUM_MAINNET_RPC,
  [ChainId.polygon]: process.env.POLYGON_MAINNET_RPC,
  [ChainId.base]: process.env.BASE_MAINNET_RPC,
  [ChainId.zora]: process.env.ZORA_MAINNET_RPC,
  [ChainId.bsc]: process.env.BSC_MAINNET_RPC,
  [ChainId.sepolia]: process.env.ETH_SEPOLIA_RPC,
  [ChainId.holesky]: process.env.ETH_HOLESKY_RPC,
  [ChainId.optimismSepolia]: process.env.OPTIMISM_SEPOLIA_RPC,
  [ChainId.bscTestnet]: process.env.BSC_TESTNET_RPC,
  [ChainId.arbitrumSepolia]: process.env.ARBITRUM_SEPOLIA_RPC,
  [ChainId.baseSepolia]: process.env.BASE_SEPOLIA_RPC,
  [ChainId.zoraSepolia]: process.env.ZORA_SEPOLIA_RPC,
  [ChainId.avalanche]: process.env.AVALANCHE_MAINNET_RPC,
  [ChainId.avalancheFuji]: process.env.AVALANCHE_FUJI_RPC,
  [ChainId.blast]: process.env.BLAST_MAINNET_RPC,
  [ChainId.blastSepolia]: process.env.BLAST_SEPOLIA_RPC,
  [ChainId.polygonAmoy]: process.env.POLYGON_AMOY_RPC,
  [ChainId.degen]: process.env.DEGEN_MAINNET_RPC,
};

export const SUPPORTED_CHAINS: Chain[] = transformBackendNetworksToChains(
  backendChains.networks,
);

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export const SUPPORTED_MAINNET_CHAINS: Chain[] = SUPPORTED_CHAINS.filter(
  (chain) => !chain.testnet,
);

export const customChainIdsToAssetNames: Record<ChainId, string> = {
  [arbitrumNova.id]: 'arbitrumnova',
  [aurora.id]: 'aurora',
  [avalanche.id]: 'avalanchex',
  [blast.id]: 'blast',
  [blastSepolia.id]: 'blastsepolia',
  [boba.id]: 'boba',
  [celo.id]: 'celo',
  [classic.id]: 'classic',
  [cronos.id]: 'cronos',
  [degen.id]: 'degen',
  [dogechain.id]: 'dogechain',
  [fantom.id]: 'fantom',
  [filecoin.id]: 'filecoin',
  [harmonyOne.id]: 'harmony',
  [immutableZkEvm.id]: 'immutablezkevm',
  [kava.id]: 'kavaevm',
  [klaytn.id]: 'klaytn',
  [linea.id]: 'linea',
  957: 'lyra',
  [manta.id]: 'manta',
  [mantle.id]: 'mantle',
  [metis.id]: 'metis',
  [mode.id]: 'mode',
  [moonbeam.id]: 'moonbeam',
  [canto.id]: 'nativecanto',
  [opBNB.id]: 'opbnb',
  [palm.id]: 'palm',
  [pgn.id]: 'pgn',
  [polygonZkEvm.id]: 'polygonzkevm',
  [pulsechain.id]: 'pulsechain',
  1380012617: 'rari',
  1918988905: 'raritestnet',
  690: 'redstone',
  17069: 'redstonegarnet',
  17001: 'redstoneholesky',
  [rootstock.id]: 'rootstock',
  31: 'rootstocktestnet',
  [scroll.id]: 'scroll',
  100: 'xdai',
  [zkSync.id]: 'zksync',
};

export const simpleHashSupportedChainNames = [
  'ethereum',
  ChainName.polygon,
  ChainName.arbitrum,
  ChainName.arbitrumNova,
  ChainName.avalanche,
  ChainName.base,
  ChainName.blast,
  ChainName.bsc,
  ChainName.celo,
  ChainName.gnosis,
  ChainName.linea,
  ChainName.manta,
  ChainName.optimism,
  ChainName.polygonZkEvm,
  ChainName.rari,
  ChainName.scroll,
  ChainName.zora,
] as (ChainName | 'ethereum' | 'ethereum-sepolia')[];

export const simpleHashSupportedTestnetChainNames = [
  'ethereum-sepolia',
  ChainName.arbitrumSepolia,
  ChainName.baseSepolia,
  ChainName.blastSepolia,
  ChainName.optimismSepolia,
  ChainName.zoraSepolia,
  ChainName.polygonAmoy,
] as (ChainName | 'ethereum-sepolia' | 'ethereum')[];

export const meteorologySupportedChains = [
  ChainId.arbitrum,
  ChainId.avalanche,
  ChainId.base,
  ChainId.blast,
  ChainId.bsc,
  ChainId.holesky,
  ChainId.sepolia,
  ChainId.mainnet,
  ChainId.polygon,
  ChainId.optimism,
  ChainId.zora,
  ChainId.degen,
];

export const needsL1SecurityFeeChains = [
  ChainId.base,
  ChainId.optimism,
  ChainId.zora,
];
