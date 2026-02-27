import { isAllowedTargetContract } from '@rainbow-me/swaps';
import { type Address } from 'viem';

import { add } from '../utils/numbers';

import { estimateApprove, estimateSwapGasLimit } from './actions';
import { estimateUnlockAndSwapFromMetadata } from './actions/swap';
import { checkSwapNeedsUnlocking } from './checkSwapNeedsUnlocking';
import { createNewAction, createNewRap } from './common';
import {
  type RapAction,
  type RapSwapActionParameters,
  type RapUnlockActionParameters,
} from './references';
import { getDefaultGasLimitForTrade } from './utils';

export const estimateUnlockAndSwap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;
  const { from: accountAddress } = quote as { from: Address };

  const unlockInfo = await checkSwapNeedsUnlocking({
    quote,
    sellAmount,
    assetToSell,
    chainId,
    accountAddress,
  });

  if (unlockInfo) {
    if (!isAllowedTargetContract(unlockInfo.spender, chainId)) {
      throw new Error('Target contract is not allowed');
    }
    // Use batch estimation to simulate approve+swap together
    // This is required because swap depends on approve happening first
    const gasLimitFromMetadata = await estimateUnlockAndSwapFromMetadata({
      chainId,
      accountAddress,
      sellTokenAddress: unlockInfo.sellTokenAddress,
      quote,
    });

    if (gasLimitFromMetadata) {
      return gasLimitFromMetadata;
    }
    // If batch estimation fails, do NOT fall through to single tx simulation
    // because swap requires approve to have happened first.
    // Return combined default gas limits for approve + swap
    const approveGasLimit = await estimateApprove({
      owner: accountAddress,
      tokenAddress: unlockInfo.sellTokenAddress,
      spender: unlockInfo.spender,
      chainId,
    });
    const swapDefaultGasLimit = getDefaultGasLimitForTrade(quote, chainId);
    return add(approveGasLimit || '0', swapDefaultGasLimit);
  }

  // No approval needed, estimate swap only
  const swapGasLimit = await estimateSwapGasLimit({
    chainId,
    requiresApprove: false,
    quote,
  });

  return swapGasLimit;
};

export const createUnlockAndSwapRap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  let actions: RapAction<'swap' | 'unlock'>[] = [];

  const { sellAmount, quote, chainId, assetToSell, assetToBuy } =
    swapParameters;
  const { from: accountAddress } = quote as { from: Address };

  const unlockInfo = await checkSwapNeedsUnlocking({
    quote,
    sellAmount: sellAmount as string,
    assetToSell,
    chainId,
    accountAddress,
  });

  if (unlockInfo) {
    if (!isAllowedTargetContract(unlockInfo.spender, chainId)) {
      throw new Error('Target contract is not allowed');
    }
    const unlock = createNewAction('unlock', {
      fromAddress: quote.from,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      chainId,
      contractAddress: unlockInfo.spender,
    } satisfies RapUnlockActionParameters);

    actions = actions.concat(unlock);
  }

  const swap = createNewAction('swap', {
    chainId,
    sellAmount,
    requiresApprove: !!unlockInfo,
    quote,
    gasParams: swapParameters.gasParams,
    meta: swapParameters.meta,
    assetToSell,
    assetToBuy,
  } satisfies RapSwapActionParameters<'swap'>);
  actions = actions.concat(swap);

  return createNewRap(actions);
};
