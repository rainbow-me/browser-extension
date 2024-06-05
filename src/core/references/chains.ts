import backendChains from 'static/data/chains.json';
import { Address } from 'viem';
import { Chain } from 'viem/chains';

import { AddressOrEth } from '../types/assets';
import {
  BackendNetwork,
  BackendNetworkServices,
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

export const needsL1SecurityFeeChains = backendChains.networks
  .filter((backendChain: BackendNetwork) => backendChain.opStack)
  .map((backendChain: BackendNetwork) => parseInt(backendChain.id, 10));

export const nativeAssetChains: Record<number, AddressOrEth> =
  backendChains.networks.reduce(
    (acc, backendChain: BackendNetwork) => {
      acc[parseInt(backendChain.id, 10)] = backendChain.nativeAsset
        .address as Address;
      return acc;
    },
    {} as Record<number, AddressOrEth>,
  );

export const nameChains: Record<number, string> = backendChains.networks.reduce(
  (acc, backendChain: BackendNetwork) => {
    acc[parseInt(backendChain.id, 10)] = backendChain.label;
    return acc;
  },
  {} as Record<number, string>,
);
const filterChainsByService = (
  servicePath: (services: BackendNetworkServices) => boolean,
): number[] => {
  return SUPPORTED_CHAINS.filter((chain) => {
    const backendNetworks = backendChains.networks as BackendNetwork[];
    const services = backendNetworks[chain.id]?.enabledServices;
    return services && servicePath(services);
  }).map((chain) => chain.id);
};

export const meteorologySupportedChains = filterChainsByService(
  (services) => services.gas.enabled,
);
export const supportedSwapChains = filterChainsByService(
  (services) => services.trade.swapping,
);
export const supportedApprovalChains = filterChainsByService(
  (services) => services.wallet.approvals,
);
export const supportedTransactionChains = filterChainsByService(
  (services) => services.wallet.transactions,
);
export const supportedBalanceChains = filterChainsByService(
  (services) => services.wallet.balance,
);
export const supportedSummaryChains = filterChainsByService(
  (services) => services.wallet.summary,
);
export const supportedTokenSearchChains = filterChainsByService(
  (services) => services.token.tokenSearch,
);
export const supportedNftChains = filterChainsByService(
  (services) => services.token.nftProxy,
);
