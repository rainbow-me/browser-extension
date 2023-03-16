import {
  ALLOWS_PERMIT,
  ChainId,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATOR,
  PermitSupportedTokenList,
  RAINBOW_ROUTER_CONTRACT_ADDRESS,
  WRAPPED_ASSET,
} from '@rainbow-me/swaps';
import { Address } from 'wagmi';

import { ETH_ADDRESS, gasUnits } from '../references';
import { isNativeAsset } from '../utils/chains';
import { add } from '../utils/numbers';
import { isLowerCaseMatch } from '../utils/strings';

import { assetNeedsUnlocking, estimateApprove } from './actions';
import { estimateCrosschainSwapGasLimit } from './actions/crosschainSwap';
import { createNewAction, createNewRap } from './common';
import {
  RapAction,
  RapCrosschainSwapActionParameters,
  RapUnlockActionParameters,
} from './references';

export const estimateUnlockAndCrosschainSwap = async (
  swapParameters: RapCrosschainSwapActionParameters,
) => {
  const { inputAmount, tradeDetails, chainId, inputCurrency, outputCurrency } =
    swapParameters;

  if (!inputCurrency || !outputCurrency || !inputAmount) {
    return gasUnits.basic_swap[chainId];
  }

  const {
    from: accountAddress,
    sellTokenAddress,
    buyTokenAddress,
  } = tradeDetails as {
    from: Address;
    sellTokenAddress: Address;
    buyTokenAddress: Address;
  };

  const isNativeAssetUnwrapping =
    (isLowerCaseMatch(sellTokenAddress, WRAPPED_ASSET?.[chainId]) &&
      isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS)) ||
    isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS_AGGREGATOR);

  let gasLimits: (string | number)[] = [];
  let swapAssetNeedsUnlocking = false;

  // Aggregators represent native asset as 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
  const nativeAsset =
    isLowerCaseMatch(ETH_ADDRESS_AGGREGATOR, sellTokenAddress) ||
    isNativeAsset(inputCurrency.address, chainId);

  if (!isNativeAssetUnwrapping && !nativeAsset) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: accountAddress,
      amount: inputAmount,
      assetToUnlock: inputCurrency,
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

  const swapGasLimit = await estimateCrosschainSwapGasLimit({
    chainId: Number(chainId),
    requiresApprove: swapAssetNeedsUnlocking,
    tradeDetails,
  });

  gasLimits = gasLimits.concat(swapGasLimit);

  return gasLimits.reduce((acc, limit) => add(acc, limit), '0');
};

export const createUnlockAndCrosschainSwapRap = async (
  swapParameters: RapCrosschainSwapActionParameters,
) => {
  let actions: RapAction[] = [];
  const { inputAmount, tradeDetails, chainId, inputCurrency } = swapParameters;

  const {
    from: accountAddress,
    sellTokenAddress,
    buyTokenAddress,
  } = tradeDetails as {
    from: Address;
    sellTokenAddress: Address;
    buyTokenAddress: Address;
  };

  const isNativeAssetUnwrapping =
    isLowerCaseMatch(sellTokenAddress, WRAPPED_ASSET[`${chainId}`]) &&
    isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS) &&
    chainId === ChainId.mainnet;

  // Aggregators represent native asset as 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
  const nativeAsset =
    isLowerCaseMatch(ETH_ADDRESS_AGGREGATOR, sellTokenAddress) ||
    isNativeAsset(inputCurrency?.address, chainId);

  let swapAssetNeedsUnlocking = false;

  if (!isNativeAssetUnwrapping && !nativeAsset) {
    swapAssetNeedsUnlocking = await assetNeedsUnlocking({
      owner: accountAddress,
      amount: inputAmount as string,
      assetToUnlock: inputCurrency,
      spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
      chainId,
    });
  }
  const allowsPermit =
    !nativeAsset &&
    chainId === ChainId.mainnet &&
    ALLOWS_PERMIT[
      inputCurrency.address?.toLowerCase() as keyof PermitSupportedTokenList
    ];

  if (swapAssetNeedsUnlocking && !allowsPermit) {
    const unlock = createNewAction('unlock', {
      fromAddress: accountAddress,
      amount: inputAmount,
      assetToUnlock: inputCurrency,
      chainId,
      contractAddress: tradeDetails.to,
    } as RapUnlockActionParameters);
    actions = actions.concat(unlock);
  }

  // create a swap rap
  const swap = createNewAction('crosschainSwap', {
    chainId,
    inputAmount,
    permit: swapAssetNeedsUnlocking && allowsPermit,
    requiresApprove: swapAssetNeedsUnlocking && !allowsPermit,
    tradeDetails,
    meta: swapParameters.meta,
  } as RapCrosschainSwapActionParameters);
  actions = actions.concat(swap);

  // create the overall rap
  const newRap = createNewRap(actions);
  return newRap;
};
