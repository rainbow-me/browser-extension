// This is to simulate the user adding custom RPC endpoints that we'll be storing in state

import { Zero } from '@ethersproject/constants';

// import { ETH_ADDRESS } from '../references';

import { SUPPORTED_CHAINS } from './chains';

// once we have a proper UI for it
export const userAddedCustomRpcEndpoints = [
  // {
  //   rpc: 'https://rpc.flashbots.net',
  //   chainId: 1,
  //   name: 'Flashbots Protect',
  //   symbol: 'ETH',
  //   explorer: 'https://etherscan.io',
  //   explorerName: 'Etherscan',
  //   active: true,
  //   nativeAssetAddress: ETH_ADDRESS,
  // },
  {
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114,
    name: 'Avax',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io',
    explorerName: 'Snowtrace',
    active: true,
    nativeAssetAddress: Zero.toHexString(),
  },
  {
    rpc: 'https://rpc.gnosis.gateway.fm',
    chainId: 100,
    name: 'Gnosis',
    symbol: 'xDAI',
    explorer: 'https://gnosisscan.io',
    explorerName: 'GnosisScan',
    active: true,
    nativeAssetAddress: Zero.toHexString(),
  },
];

export const findCustomNetworkForChainId = (chainId: number) => {
  return userAddedCustomRpcEndpoints.find(
    (network) => network.chainId === chainId && network.active,
  );
};

export const getCustomNetworks = () =>
  userAddedCustomRpcEndpoints.filter(
    (network) =>
      isCustomNetwork(network.chainId) &&
      SUPPORTED_CHAINS.every((chain) => chain.id !== network.chainId),
  );

export const isCustomNetwork = (chainId: number) =>
  !!findCustomNetworkForChainId(chainId);
