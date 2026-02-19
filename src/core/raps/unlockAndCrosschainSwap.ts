import { add } from '../utils/numbers';

import { assetNeedsUnlocking, estimateApprove } from './actions';
import { estimateCrosschainSwapGasLimit } from './actions/crosschainSwap';
import { createNewAction, createNewRap } from './common';
import {
  RapAction,
  RapSwapActionParameters,
  RapUnlockActionParameters,
} from './references';
import { getQuoteAllowanceTargetAddress } from './utils';

export const estimateUnlockAndCrosschainSwap = async (
  swapParameters: RapSwapActionParameters<'crosschainSwap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;

  const allowanceTargetAddress = quote.allowanceNeeded
    ? getQuoteAllowanceTargetAddress(quote)
    : null;

  let gasLimits: (string | number)[] = [];
  let swapAssetNeedsUnlocking = false;

  if (allowanceTargetAddress) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: quote.from,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      spender: allowanceTargetAddress,
      chainId,
    });
  }

  let unlockGasLimit;

  if (swapAssetNeedsUnlocking && allowanceTargetAddress) {
    unlockGasLimit = await estimateApprove({
      owner: quote.from,
      tokenAddress: quote.sellTokenAddress,
      spender: allowanceTargetAddress,
      chainId,
    });
    gasLimits = gasLimits.concat(unlockGasLimit);
  }

  const swapGasLimit = await estimateCrosschainSwapGasLimit({
    chainId,
    requiresApprove: swapAssetNeedsUnlocking,
    quote,
  });

  const gasLimit = gasLimits
    .concat(swapGasLimit)
    .reduce((acc, limit) => add(acc, limit), '0');

  return gasLimit.toString();
};

export const createUnlockAndCrosschainSwapRap = async (
  swapParameters: RapSwapActionParameters<'crosschainSwap'>,
) => {
  let actions: RapAction<'crosschainSwap' | 'unlock'>[] = [];
  const { sellAmount, assetToBuy, quote, chainId, assetToSell } =
    swapParameters;

  const allowanceTargetAddress = quote.allowanceNeeded
    ? getQuoteAllowanceTargetAddress(quote)
    : null;

  let swapAssetNeedsUnlocking = false;

  if (allowanceTargetAddress) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: quote.from,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      spender: allowanceTargetAddress,
      chainId,
    });
  }

  if (swapAssetNeedsUnlocking && allowanceTargetAddress) {
    const unlock = createNewAction('unlock', {
      fromAddress: quote.from,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      chainId,
      contractAddress: allowanceTargetAddress,
    } satisfies RapUnlockActionParameters);
    actions = actions.concat(unlock);
  }

  // create a swap rap
  const swap = createNewAction('crosschainSwap', {
    chainId,
    requiresApprove: swapAssetNeedsUnlocking,
    quote,
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
