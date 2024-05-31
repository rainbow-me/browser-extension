import { Chain } from 'viem';

import chainsData from 'static/data/chains.json';

type Device = 'BX' | 'APP';

export interface Network {
  id: string;
  name: string;
  label: string;
  testnet: boolean;
  opStack: boolean;
  icons: {
    badgeURL: string;
  };
  defaultExplorer: {
    url: string;
    label: string;
    transactionURL: string;
    tokenURL: string;
  };
  defaultRPC: {
    enabledDevices: Array<Device | null>;
    url: string;
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
  enabledServices: {
    gas: {
      enabled: boolean;
      eip1559Enabled: boolean;
      legacyEnabled: boolean;
    };
    trade: {
      swapping: boolean;
      bridging: boolean;
    };
    wallet: {
      approvals: boolean;
      transactions: boolean;
      balance: boolean;
      summary: boolean;
      defiPositions: boolean;
      hasActivity: boolean;
    };
    token: {
      tokenSearch: boolean;
      nftProxy: boolean;
    };
  };
}

function transformNetworkToChain(network: Network): Chain {
  if (!network) {
    throw new Error('Invalid network data');
  }

  return {
    id: parseInt(network.id, 10),
    name: network.name,
    testnet: network.testnet,
    nativeCurrency: {
      name: network.nativeAsset.name,
      symbol: network.nativeAsset.symbol,
      decimals: network.nativeAsset.decimals,
    },
    rpcUrls: {
      default: {
        http: [network.defaultRPC.url],
      },
    },
    blockExplorers: {
      default: {
        url: network.defaultExplorer.url,
        name: network.defaultExplorer.label,
      },
    },
  };
}

function transformGetNetworksQueryToChains(networks?: Network[]): Chain[] {
  if (!networks) {
    return [];
  }
  return networks.map((network) => transformNetworkToChain(network));
}

export async function handleChains() {
  const chains = transformGetNetworksQueryToChains(
    chainsData.networks as Network[],
  );
  console.log('-- chains', chains);
}
