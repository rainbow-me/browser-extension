import {
  ALLOWS_PERMIT,
  ChainId,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATOR,
  PermitSupportedTokenList,
  RAINBOW_ROUTER_CONTRACT_ADDRESS,
  WRAPPED_ASSET,
} from '@rainbow-me/swaps';
import { Address } from 'wagmi';

import { ETH_ADDRESS } from '../references';
import { isNativeAsset } from '../utils/chains';
import { add } from '../utils/numbers';
import { isLowerCaseMatch } from '../utils/strings';
import { isUnwrapEth } from '../utils/swaps';

import {
  assetNeedsUnlocking,
  estimateApprove,
  estimateSwapGasLimit,
} from './actions';
import { createNewAction, createNewRap } from './common';
import {
  RapAction,
  RapSwapActionParameters,
  RapUnlockActionParameters,
} from './references';

export const estimateUnlockAndSwap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  const { sellAmount, quote, chainId, assetToSell } = swapParameters;

  const {
    from: accountAddress,
    sellTokenAddress,
    buyTokenAddress,
  } = quote as {
    from: Address;
    sellTokenAddress: Address;
    buyTokenAddress: Address;
  };

  const isNativeAssetUnwrapping =
    isLowerCaseMatch(sellTokenAddress, WRAPPED_ASSET?.[chainId]) &&
    (isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS?.[chainId]) ||
      isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS_AGGREGATOR?.[chainId]));

  let gasLimits: (string | number)[] = [];
  let swapAssetNeedsUnlocking = false;

  const nativeAsset =
    isLowerCaseMatch(ETH_ADDRESS_AGGREGATOR, sellTokenAddress) ||
    isNativeAsset(sellTokenAddress, chainId);

  if (!isNativeAssetUnwrapping && !nativeAsset) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: accountAddress,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
      chainId,
    });
  }

  let unlockGasLimit;

  if (swapAssetNeedsUnlocking) {
    unlockGasLimit = await estimateApprove({
      owner: accountAddress,
      tokenAddress: sellTokenAddress,
      spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
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
    .reduce((acc, limit) => add(acc, limit), '0');

  return gasLimit.toString();
};

export const createUnlockAndSwapRap = async (
  swapParameters: RapSwapActionParameters<'swap'>,
) => {
  let actions: RapAction<'swap' | 'unlock'>[] = [];

  const { sellAmount, quote, chainId, assetToSell } = swapParameters;

  const {
    from: accountAddress,
    sellTokenAddress,
    buyTokenAddress,
  } = quote as {
    from: Address;
    sellTokenAddress: Address;
    buyTokenAddress: Address;
  };

  const isNativeAssetUnwrapping =
    isUnwrapEth({ buyTokenAddress, chainId, sellTokenAddress }) &&
    chainId === ChainId.mainnet;

  // Aggregators represent native asset as 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
  const nativeAsset =
    isLowerCaseMatch(ETH_ADDRESS_AGGREGATOR, sellTokenAddress) ||
    isNativeAsset(sellTokenAddress, chainId);

  let swapAssetNeedsUnlocking = false;

  if (!isNativeAssetUnwrapping && !nativeAsset) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: accountAddress,
      amount: sellAmount as string,
      assetToUnlock: assetToSell,
      spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
      chainId,
    });
  }

  const allowsPermit =
    !nativeAsset &&
    chainId === ChainId.mainnet &&
    ALLOWS_PERMIT[
      assetToSell.address?.toLowerCase() as keyof PermitSupportedTokenList
    ];

  if (swapAssetNeedsUnlocking && !allowsPermit) {
    const unlock = createNewAction('unlock', {
      fromAddress: accountAddress,
      amount: sellAmount,
      assetToUnlock: assetToSell,
      chainId,
      contractAddress: RAINBOW_ROUTER_CONTRACT_ADDRESS,
    } as RapUnlockActionParameters);
    actions = actions.concat(unlock);
  }

  // create a swap rap
  const swap = createNewAction('swap', {
    chainId,
    sellAmount,
    permit: swapAssetNeedsUnlocking && allowsPermit,
    requiresApprove: swapAssetNeedsUnlocking && !allowsPermit,
    quote,
    meta: swapParameters.meta,
    assetToSell,
  } as RapSwapActionParameters<'swap'>);
  actions = actions.concat(swap);

  // create the overall rap
  const newRap = createNewRap(actions);
  return newRap;
};
