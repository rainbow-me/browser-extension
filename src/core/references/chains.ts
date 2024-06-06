import backendChains from 'static/data/chains.json';
import { Address } from 'viem';
import { Chain } from 'viem/chains';

import { AddressOrEth } from '../types/assets';
import {
  BackendNetwork,
  BackendNetworkServices,
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
const filterChainIdsByService = (
  servicePath: (services: BackendNetworkServices) => boolean,
): number[] => {
  return backendChains.networks
    .filter((network: BackendNetwork) => {
      const services = network?.enabledServices;
      return services && servicePath(services);
    })
    .map((network: BackendNetwork) => parseInt(network.id, 10));
};

export const meteorologySupportedChainIds = filterChainIdsByService(
  (services) => services.meteorology.enabled,
);

export const supportedSwapChainIds = filterChainIdsByService(
  (services) => services.swap.enabled,
);

export const supportedApprovalChainIds = filterChainIdsByService(
  (services) => services.addys.approvals,
);

export const supportedTransactionChainIds = filterChainIdsByService(
  (services) => services.addys.transactions,
);

export const supportedBalanceChainIds = filterChainIdsByService(
  (services) => services.addys.balance,
);

export const supportedPositionsChainIds = filterChainIdsByService(
  (services) => services.addys.positions,
);

export const supportedTokenSearchChainIds = filterChainIdsByService(
  (services) => services.tokenSearch.enabled,
);

export const supportedNftChainIds = filterChainIdsByService(
  (services) => services.nftProxy.enabled,
);
