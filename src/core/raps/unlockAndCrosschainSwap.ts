import { isAllowedTargetContract } from '@rainbow-me/swaps';

import { crosschainQuoteTargetsRecipient } from '~/core/utils/quotes';

import { add } from '../utils/numbers';

import { estimateApprove, needsTokenApproval } from './actions';
import { estimateCrosschainSwapGasLimit } from './actions/crosschainSwap';
import { createNewAction, createNewRap } from './common';
import type {
  RapAction,
  RapSwapActionParameters,
  RapUnlockActionParameters,
} from './references';
import { getQuoteAllowanceTargetAddress } from './validation';

export const estimateUnlockAndCrosschainSwap = async (
  swapParameters: RapSwapActionParameters<'crosschainSwap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;

  if (!crosschainQuoteTargetsRecipient(quote, quote.from)) {
    throw new Error('Crosschain quote does not target recipient');
  }

  const allowanceTargetAddress = quote.allowanceNeeded
    ? getQuoteAllowanceTargetAddress(quote)
    : null;

  let gasLimits: (string | number)[] = [];
  let swapAssetNeedsUnlocking = false;

  if (allowanceTargetAddress) {
    if (!isAllowedTargetContract(allowanceTargetAddress, chainId)) {
      throw new Error('Target contract is not allowed');
    }
    swapAssetNeedsUnlocking = await needsTokenApproval({
      owner: quote.from,
      tokenAddress: quote.sellTokenAddress,
      spender: allowanceTargetAddress,
      amount: sellAmount,
      chainId,
      decimals: assetToSell.decimals,
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

  if (!crosschainQuoteTargetsRecipient(quote, quote.from)) {
    throw new Error('Crosschain quote does not target recipient');
  }

  const allowanceTargetAddress = quote.allowanceNeeded
    ? getQuoteAllowanceTargetAddress(quote)
    : null;

  let swapAssetNeedsUnlocking = false;

  if (allowanceTargetAddress) {
    if (!isAllowedTargetContract(allowanceTargetAddress, chainId)) {
      throw new Error('Target contract is not allowed');
    }
    swapAssetNeedsUnlocking = await needsTokenApproval({
      owner: quote.from,
      tokenAddress: quote.sellTokenAddress,
      spender: allowanceTargetAddress,
      amount: sellAmount,
      chainId,
      decimals: assetToSell.decimals,
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
