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

import {
  ChainId,
  ChainName,
  chainHardhat,
  chainHardhatOptimism,
} from '../types/chains';
import { transformBackendNetworksToChains } from '../utils/backendNetworks';

const IS_TESTING = process.env.IS_TESTING === 'true';

const BACKEND_CHAINS = transformBackendNetworksToChains(backendChains.networks);

export const SUPPORTED_CHAINS: Chain[] = IS_TESTING
  ? [...BACKEND_CHAINS, chainHardhat, chainHardhatOptimism]
  : BACKEND_CHAINS;

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
