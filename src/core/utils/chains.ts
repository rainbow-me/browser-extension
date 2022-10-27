import { ChainName } from '~/core/types/chains';
import { NATIVE_ASSETS_PER_CHAIN } from '~/core/references';
import { Address } from 'wagmi';

/**
 * @desc Checks if the given chain is a Layer 2.
 * @param chain The chain name to check.
 * @return Whether or not the chain is an L2 network.
 */
export const isL2Chain = (chain: string): boolean => {
  switch (chain) {
    case ChainName.arbitrum:
    case ChainName.bsc:
    case ChainName.optimism:
    case ChainName.polygon:
      return true;
    default:
      return false;
  }
};

export function isNativeAsset(address: Address, chain: ChainName) {
  return (
    NATIVE_ASSETS_PER_CHAIN[chain]?.toLowerCase() === address?.toLowerCase()
  );
}
