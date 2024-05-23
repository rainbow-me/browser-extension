import { Chain } from 'viem';

import { proxyRpcEndpoint } from '../providers';
import { connectedToHardhatStore } from '../state/currentSettings/connectedToHardhat';
import { ChainId, chainHardhat, chainHardhatOptimism } from '../types/chains';
import { findRainbowChainForChainId } from '../utils/rainbowChains';

const IS_TESTING = process.env.IS_TESTING === 'true';

export const getDefaultRPC = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.mainnet:
      return { http: process.env.ETH_MAINNET_RPC };
    case ChainId.optimism:
      return { http: process.env.OPTIMISM_MAINNET_RPC };
    case ChainId.arbitrum:
      return { http: process.env.ARBITRUM_MAINNET_RPC };
    case ChainId.polygon:
      return { http: process.env.POLYGON_MAINNET_RPC };
    case ChainId.base:
      return { http: process.env.BASE_MAINNET_RPC };
    case ChainId.zora:
      return { http: process.env.ZORA_MAINNET_RPC };
    case ChainId.bsc:
      return { http: process.env.BSC_MAINNET_RPC };
    case ChainId.sepolia:
      return { http: process.env.ETH_SEPOLIA_RPC };
    case ChainId.holesky:
      return { http: process.env.ETH_HOLESKY_RPC };
    case ChainId.optimismSepolia:
      return { http: process.env.OPTIMISM_SEPOLIA_RPC };
    case ChainId.bscTestnet:
      return { http: process.env.BSC_TESTNET_RPC };
    case ChainId.arbitrumSepolia:
      return { http: process.env.ARBITRUM_SEPOLIA_RPC };
    case ChainId.baseSepolia:
      return { http: process.env.BASE_SEPOLIA_RPC };
    case ChainId.zoraSepolia:
      return { http: process.env.ZORA_SEPOLIA_RPC };
    case ChainId.avalanche:
      return { http: process.env.AVALANCHE_MAINNET_RPC };
    case ChainId.avalancheFuji:
      return { http: process.env.AVALANCHE_FUJI_RPC };
    case ChainId.blast:
      return { http: process.env.BLAST_MAINNET_RPC };
    case ChainId.blastSepolia:
      return { http: process.env.BLAST_SEPOLIA_RPC };
    case ChainId.polygonAmoy:
      return { http: process.env.POLYGON_AMOY_RPC };
    case ChainId.degen:
      return { http: process.env.DEGEN_MAINNET_RPC };
    default:
      return null;
  }
};

const getOriginalRpcEndpoint = (chain: Chain) => {
  const userAddedNetwork = findRainbowChainForChainId(chain.id);
  if (userAddedNetwork) {
    return userAddedNetwork.rpcUrls.default.http[0];
  }
  return getDefaultRPC(chain.id)?.http;
};

export const handleRpcUrl = (chain: Chain) => {
  if (
    (IS_TESTING &&
      ((chain.id === ChainId.mainnet &&
        connectedToHardhatStore.getState().connectedToHardhat) ||
        (chain.id === ChainId.optimism &&
          connectedToHardhatStore.getState().connectedToHardhatOp))) ||
    chain.id === chainHardhat.id ||
    chain.id === chainHardhatOptimism.id
  ) {
    return chainHardhat.rpcUrls.default.http[0];
  } else {
    return proxyRpcEndpoint(getOriginalRpcEndpoint(chain) || '', chain.id);
  }
};
