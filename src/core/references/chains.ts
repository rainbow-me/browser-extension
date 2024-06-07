import backendNetworks from 'static/data/networks.json';
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

const BACKEND_CHAINS = transformBackendNetworksToChains(
  backendNetworks.networks,
);

export const SUPPORTED_CHAINS: Chain[] = IS_TESTING
  ? [...BACKEND_CHAINS, chainHardhat, chainHardhatOptimism]
  : BACKEND_CHAINS;

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id);

export const SUPPORTED_MAINNET_CHAINS: Chain[] = SUPPORTED_CHAINS.filter(
  (chain) => !chain.testnet,
);

export const needsL1SecurityFeeChains = backendNetworks.networks
  .filter((backendNetwork: BackendNetwork) => backendNetwork.opStack)
  .map((backendNetwork: BackendNetwork) => parseInt(backendNetwork.id, 10));

export const chainsNativeAsset: Record<number, AddressOrEth> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] = backendNetwork.nativeAsset
        .address as Address;
      return acc;
    },
    {} as Record<number, AddressOrEth>,
  );

export const chainsLabel: Record<number, string> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] = backendNetwork.label;
      return acc;
    },
    {} as Record<number, string>,
  );

export const chainsName: Record<number, string> =
  backendNetworks.networks.reduce(
    (acc, backendNetwork: BackendNetwork) => {
      acc[parseInt(backendNetwork.id, 10)] = backendNetwork.name;
      return acc;
    },
    {} as Record<number, string>,
  );

const filterChainIdsByService = (
  servicePath: (services: BackendNetworkServices) => boolean,
): number[] => {
  return backendNetworks.networks
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

export const supportedApprovalsChainIds = filterChainIdsByService(
  (services) => services.addys.approvals,
);

export const supportedTransactionsChainIds = filterChainIdsByService(
  (services) => services.addys.transactions,
);

export const supportedAssetsChainIds = filterChainIdsByService(
  (services) => services.addys.assets,
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
