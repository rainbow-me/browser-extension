import { Network } from '~/core/types';

/**
 * @desc Checks if the given network is a Layer 2.
 * @param network The network to check.
 * @return Whether or not the network is a L2 network.
 */
export const isL2Network = (network: Network | string): boolean => {
  switch (network) {
    case Network.arbitrum:
    case Network.optimism:
    case Network.polygon:
      return true;
    default:
      return false;
  }
};
