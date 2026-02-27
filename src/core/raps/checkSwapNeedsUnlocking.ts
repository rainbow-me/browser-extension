import type { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import type { Address } from 'viem';

import type { ParsedAsset } from '../types/assets';
import type { ChainId } from '../types/chains';

import { assetNeedsUnlocking } from './actions';
import { getTargetAddressForQuote } from './utils';

/**
 * Checks if a swap asset needs unlocking and returns the spender address.
 * Shared logic for both same-chain and cross-chain swaps.
 * Matches original behavior: checks allowanceNeeded from quote first, then verifies with assetNeedsUnlocking.
 */
export const checkSwapNeedsUnlocking = async ({
  quote,
  sellAmount,
  assetToSell,
  chainId,
  accountAddress,
}: {
  quote: Quote | CrosschainQuote;
  sellAmount: string;
  assetToSell: ParsedAsset;
  chainId: ChainId;
  accountAddress: Address;
}): Promise<{
  needsUnlocking: boolean;
  spender: Address;
  sellTokenAddress: Address;
} | null> => {
  const { allowanceNeeded, sellTokenAddress } = quote as {
    allowanceNeeded: boolean;
    sellTokenAddress: string;
  };

  // Check: if quote says allowance not needed, return early
  if (!allowanceNeeded) {
    return null;
  }

  // For same-chain swaps, spender is the swap target address
  // For cross-chain swaps, spender is the allowanceTarget
  const spender =
    'allowanceTarget' in quote && quote.allowanceTarget
      ? (quote.allowanceTarget as Address)
      : getTargetAddressForQuote(quote);

  // Verify on-chain that asset actually needs unlocking
  // This matches the original behavior - both checks were performed
  const needsUnlocking = await assetNeedsUnlocking({
    owner: accountAddress,
    amount: sellAmount,
    assetToUnlock: assetToSell,
    spender,
    chainId,
  });

  if (!needsUnlocking) {
    return null;
  }

  return {
    needsUnlocking: true,
    spender,
    sellTokenAddress: sellTokenAddress as Address,
  };
};
