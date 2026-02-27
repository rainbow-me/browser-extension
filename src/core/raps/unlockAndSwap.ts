import { isAllowedTargetContract } from '@rainbow-me/swaps';

import { add } from '../utils/numbers';

import {
  estimateApprove,
  estimateSwapGasLimit,
  needsTokenApproval,
} from './actions';
import { estimateUnlockAndSwap as estimateUnlockAndSwapSteps } from './actions/swap';
import { createNewAction, createNewRap } from './common';
import {
  type RapAction,
  type RapSwapActionParameters,
  type RapUnlockActionParameters,
} from './references';
import { getQuoteAllowanceTargetAddress } from './validation';

export const estimateUnlockAndSwap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;

  const allowanceTargetAddress = quote.allowanceNeeded
    ? getQuoteAllowanceTargetAddress(quote)
    : null;

  let gasLimits: (string | number)[] = [];
  let requiresApprove = false;

  if (allowanceTargetAddress) {
    if (!isAllowedTargetContract(allowanceTargetAddress, chainId)) {
      throw new Error('Target contract is not allowed');
    }

    requiresApprove = await needsTokenApproval({
      owner: quote.from,
      tokenAddress: quote.sellTokenAddress,
      spender: allowanceTargetAddress,
      amount: sellAmount,
      chainId,
      decimals: assetToSell.decimals,
    });
  }

  if (requiresApprove && allowanceTargetAddress) {
    const gasLimitFromMetadata = await estimateUnlockAndSwapSteps({
      requiresApprove,
      chainId,
      accountAddress: quote.from,
      sellTokenAddress: quote.sellTokenAddress,
      quote,
    });

    if (gasLimitFromMetadata) {
      return gasLimitFromMetadata;
    }

    const unlockGasLimit = await estimateApprove({
      owner: quote.from,
      tokenAddress: quote.sellTokenAddress,
      spender: allowanceTargetAddress,
      chainId,
    });
    gasLimits = gasLimits.concat(unlockGasLimit);
  }

  const swapGasLimit = await estimateSwapGasLimit({
    chainId,
    requiresApprove,
    quote,
  });

  const gasLimit = gasLimits
    .concat(swapGasLimit)
    .reduce((acc, limit) => add(acc, limit), '0');

  return gasLimit.toString();
};

export const createUnlockAndSwapRap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  let actions: RapAction<'swap' | 'unlock'>[] = [];

  const { sellAmount, quote, chainId, assetToSell, assetToBuy } =
    swapParameters;

  const allowanceTargetAddress = quote.allowanceNeeded
    ? getQuoteAllowanceTargetAddress(quote)
    : null;

  let requiresApprove = false;

  if (allowanceTargetAddress) {
    if (!isAllowedTargetContract(allowanceTargetAddress, chainId)) {
      throw new Error('Target contract is not allowed');
    }

    requiresApprove = await needsTokenApproval({
      owner: quote.from,
      tokenAddress: quote.sellTokenAddress,
      spender: allowanceTargetAddress,
      amount: sellAmount,
      chainId,
      decimals: assetToSell.decimals,
    });
  }

  if (requiresApprove && allowanceTargetAddress) {
    const unlock = createNewAction('unlock', {
      fromAddress: quote.from,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      chainId,
      contractAddress: allowanceTargetAddress,
    } satisfies RapUnlockActionParameters);

    actions = actions.concat(unlock);
  }

  const swap = createNewAction('swap', {
    chainId,
    sellAmount,
    requiresApprove,
    quote,
    gasParams: swapParameters.gasParams,
    meta: swapParameters.meta,
    assetToSell,
    assetToBuy,
  } satisfies RapSwapActionParameters<'swap'>);
  actions = actions.concat(swap);

  return createNewRap(actions);
};
