import backendChains from 'static/data/chains.json';
import { Chain } from 'viem/chains';

import {
  BackendNetwork,
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

export const meteorologySupportedChains = backendChains.networks
  .filter(
    (backendChain: BackendNetwork) => backendChain.enabledServices.gas.enabled,
  )
  .map((backendChain: BackendNetwork) => parseInt(backendChain.id, 10));

export const needsL1SecurityFeeChains = backendChains.networks
  .filter((backendChain: BackendNetwork) => backendChain.opStack)
  .map((backendChain: BackendNetwork) => parseInt(backendChain.id, 10));
