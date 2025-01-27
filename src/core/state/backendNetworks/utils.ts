import { Chain } from 'viem';
import { mainnet } from 'viem/chains';
import { i18n } from '~/core/languages';

import { BackendNetwork, ChainId, CustomNetwork } from '~/core/types/chains';

const IS_DEV = process.env.IS_DEV === 'true';
const RPC_PROXY_API_KEY = process.env.RPC_PROXY_API_KEY;
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${RPC_PROXY_API_KEY}`;
};

export function transformBackendNetworkToChain<B extends boolean = false>(network: BackendNetwork<B>): Chain {
  if (!network) {
    throw new Error('Invalid network data');
  }
  const defaultRpcUrl = proxyBackendNetworkRpcEndpoint(network.defaultRPC.url);

  return {
    id: parseInt(network.id, 10),
    name: network.label ?? '',
    testnet: network.testnet,
    nativeCurrency: {
      name: network.nativeAsset.name ?? '',
      symbol: network.nativeAsset.symbol ?? '',
      decimals: network.nativeAsset.decimals ?? 18,
    },
    rpcUrls: {
      default: {
        http: [defaultRpcUrl],
      },
      public: {
        http: [defaultRpcUrl],
      },
    },
    blockExplorers: {
      default: {
        url: network.defaultExplorer.url,
        name: network.defaultExplorer.label ?? '',
      },
    },
    contracts:
      parseInt(network.id, 10) === mainnet.id ? mainnet.contracts : undefined,
  };
}

export function transformBackendNetworksToChains<B extends boolean = false>(
  networks?: BackendNetwork<B>[],
): Chain[] {
  if (!networks) {
    return [];
  }
  // include all networks for internal builds, otherwise filter out flagged as internal
  return networks
    .filter((network) => !network.internal || INTERNAL_BUILD || IS_DEV)
    .map((network) => transformBackendNetworkToChain(network));
}

export const transformCustomNetworkToBackendNetwork = (customNetwork: CustomNetwork): BackendNetwork<true> => {
  return {
    id: customNetwork.id.toString(),
    name: customNetwork.name,
    label: undefined,
    icons: {
      badgeURL: customNetwork.iconURL,
    },
    testnet: customNetwork.testnet.isTestnet,
    testnetFaucet: customNetwork.testnet.FaucetURL,
    internal: false,
    opStack: undefined,
    defaultExplorer: {
      url: customNetwork.defaultExplorerURL,
      label: i18n.t('settings.custom_rpc.block_explorer_url'),
      transactionURL: undefined,
      tokenURL: undefined,
    },
    defaultRPC: {
      enabledDevices: ['BX'],
      url: customNetwork.defaultRPCURL,
    },
    gasUnits: undefined,
    nativeAsset: {
      address: undefined,
      name: undefined,
      symbol: customNetwork.nativeAsset.symbol,
      decimals: customNetwork.nativeAsset.decimals,
      iconURL: customNetwork.nativeAsset.iconURL,
      colors: undefined,
    },
    nativeWrappedAsset: undefined,
    privateMempoolTimeout: undefined,
    enabledServices: undefined,
  };
};

export function toChainId(id: string): ChainId {
  return parseInt(id, 10);
}