import {
  type CrosschainQuote,
  isAllowedTargetContract,
} from '@rainbow-me/swaps';
import { type Address } from 'viem';

import { crosschainQuoteTargetsRecipient } from '~/core/utils/quotes';

import { add } from '../utils/numbers';

import { estimateApprove } from './actions';
import { estimateCrosschainSwapGasLimit } from './actions/crosschainSwap';
import { estimateUnlockAndSwapFromMetadata } from './actions/swap';
import { checkSwapNeedsUnlocking } from './checkSwapNeedsUnlocking';
import { createNewAction, createNewRap } from './common';
import type {
  RapAction,
  RapSwapActionParameters,
  RapUnlockActionParameters,
} from './references';
import { getDefaultGasLimitForTrade } from './utils';

export const estimateUnlockAndCrosschainSwap = async (
  swapParameters: RapSwapActionParameters<'crosschainSwap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;
  const { from: accountAddress } = quote as { from: Address };

  if (!crosschainQuoteTargetsRecipient(quote, quote.from)) {
    throw new Error('Crosschain quote does not target recipient');
  }

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
    // For crosschain swaps, use quote default or fallback to chain defaults
    const swapDefaultGasLimit =
      (quote as CrosschainQuote)?.routes?.[0]?.userTxs?.[0]?.gasFees
        ?.gasLimit || getDefaultGasLimitForTrade(quote, chainId);
    return add(approveGasLimit || '0', swapDefaultGasLimit);
  }

  // No approval needed, estimate swap only
  const swapGasLimit = await estimateCrosschainSwapGasLimit({
    chainId,
    requiresApprove: false,
    quote,
  });

  return swapGasLimit;
};

export const createUnlockAndCrosschainSwapRap = async (
  swapParameters: RapSwapActionParameters<'crosschainSwap'>,
) => {
  let actions: RapAction<'crosschainSwap' | 'unlock'>[] = [];
  const { sellAmount, assetToBuy, quote, chainId, assetToSell } =
    swapParameters;
  const { from: accountAddress } = quote as { from: Address };

  if (!crosschainQuoteTargetsRecipient(quote, quote.from)) {
    throw new Error('Crosschain quote does not target recipient');
  }

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
    const unlock = createNewAction('unlock', {
      fromAddress: quote.from,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      chainId,
      contractAddress: unlockInfo.spender,
    } satisfies RapUnlockActionParameters);
    actions = actions.concat(unlock);
  }

  // create a swap rap
  const swap = createNewAction('crosschainSwap', {
    chainId,
    requiresApprove: !!unlockInfo,
    quote,
    gasParams: swapParameters.gasParams,
    meta: swapParameters.meta,
    assetToSell,
    sellAmount,
    assetToBuy,
  } satisfies RapSwapActionParameters<'crosschainSwap'>);
  actions = actions.concat(swap);

  // create the overall rap
  const newRap = createNewRap(actions);
  return newRap;
};
