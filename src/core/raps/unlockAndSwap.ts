import {
  ChainId as SwapChainId,
  isAllowedTargetContract,
} from '@rainbow-me/swaps';
import { Address } from 'viem';

import {
  assetNeedsUnlocking,
  estimateApprove,
  estimateSwapGasLimit,
} from './actions';
import { estimateUnlockAndSwapFromMetadata } from './actions/swap';
import { createNewAction, createNewRap } from './common';
import {
  RapAction,
  RapSwapActionParameters,
  RapUnlockActionParameters,
} from './references';
import { getTargetAddressForQuote } from './utils';

export const estimateUnlockAndSwap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;

  const {
    from: accountAddress,
    sellTokenAddress,
    allowanceNeeded,
  } = quote as {
    from: Address;
    sellTokenAddress: Address;
    buyTokenAddress: Address;
    allowanceNeeded: boolean;
  };

  let gasLimits: bigint[] = [];
  let swapAssetNeedsUnlocking = false;

  if (allowanceNeeded) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: accountAddress,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      spender: getTargetAddressForQuote(quote),
      chainId,
    });
  }

  if (swapAssetNeedsUnlocking) {
    const gasLimitFromMetadata = await estimateUnlockAndSwapFromMetadata({
      swapAssetNeedsUnlocking,
      chainId,
      accountAddress,
      sellTokenAddress,
      quote,
    });
    if (gasLimitFromMetadata) {
      return gasLimitFromMetadata;
    }
  }

  let unlockGasLimit;

  if (swapAssetNeedsUnlocking) {
    const targetAddress = getTargetAddressForQuote(quote);
    const isAllowedTarget = isAllowedTargetContract(
      targetAddress,
      chainId as unknown as SwapChainId,
    );
    if (!isAllowedTarget) {
      throw new Error('Target contract is not allowed');
    }
    unlockGasLimit = await estimateApprove({
      owner: accountAddress,
      tokenAddress: sellTokenAddress,
      spender: getTargetAddressForQuote(quote),
      chainId,
    });
    gasLimits = gasLimits.concat(unlockGasLimit);
  }

  const swapGasLimit = await estimateSwapGasLimit({
    chainId,
    requiresApprove: swapAssetNeedsUnlocking,
    quote,
  });

  const gasLimit = gasLimits
    .concat(swapGasLimit)
    .reduce((acc, limit) => acc + limit, 0n);

  return gasLimit.toString();
};

export const createUnlockAndSwapRap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  let actions: RapAction<'swap' | 'unlock'>[] = [];

  const { sellAmount, quote, chainId, assetToSell, assetToBuy } =
    swapParameters;

  const { from: accountAddress, allowanceNeeded } = quote as {
    from: Address;
    sellTokenAddress: Address;
    buyTokenAddress: Address;
    allowanceNeeded: boolean;
  };

  let swapAssetNeedsUnlocking = false;

  if (allowanceNeeded) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: accountAddress,
      amount: sellAmount as string,
      assetToUnlock: assetToSell,
      spender: getTargetAddressForQuote(quote),
      chainId,
    });
  }

  if (swapAssetNeedsUnlocking) {
    const unlock = createNewAction('unlock', {
      fromAddress: accountAddress,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      chainId,
      contractAddress: getTargetAddressForQuote(quote),
    } as RapUnlockActionParameters);
    actions = actions.concat(unlock);
  }

  // create a swap rap
  const swap = createNewAction('swap', {
    chainId,
    sellAmount,
    requiresApprove: swapAssetNeedsUnlocking,
    quote,
    meta: swapParameters.meta,
    assetToSell,
    assetToBuy,
    serializedGasParams: swapParameters.serializedGasParams,
  } satisfies RapSwapActionParameters<'swap'>);
  actions = actions.concat(swap);

  // create the overall rap
  const newRap = createNewRap(actions);
  return newRap;
};
