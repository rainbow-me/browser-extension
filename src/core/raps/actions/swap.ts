import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  WRAPPED_ASSET,
  fillQuote,
  getQuoteExecutionDetails,
  getWrappedAssetMethod,
  unwrapNativeAsset,
  wrapNativeAsset,
} from '@rainbow-me/swaps';
import { getProvider } from '@wagmi/core';
import { Wallet } from 'ethers';
import { Chain } from 'wagmi';

import { isLowerCaseMatch } from '~/core/utils/strings';
import { logger } from '~/logger';

import { ETH_ADDRESS, ethUnits } from '../../references';
import { gasStore } from '../../state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import {
  ProtocolType,
  TransactionStatus,
  TransactionType,
} from '../../types/transactions';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/numbers';
import { Rap, RapSwapActionParameters } from '../references';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getBasicSwapGasLimit,
  getDefaultGasLimitForTrade,
  overrideWithFastSpeedIfNeeded,
} from '../utils';

const WRAP_GAS_PADDING = 1.002;

export const estimateSwapGasLimit = async ({
  chainId,
  requiresApprove,
  tradeDetails,
}: {
  chainId: Chain['id'];
  requiresApprove?: boolean;
  tradeDetails: Quote;
}): Promise<string> => {
  const provider = getProvider({ chainId });
  if (!provider || !tradeDetails) {
    return getBasicSwapGasLimit(chainId);
  }

  const { sellTokenAddress, buyTokenAddress } = tradeDetails;
  const isWrapNativeAsset =
    isLowerCaseMatch(sellTokenAddress, ETH_ADDRESS_AGGREGATORS) &&
    isLowerCaseMatch(buyTokenAddress, WRAPPED_ASSET[chainId]);

  const isUnwrapNativeAsset =
    isLowerCaseMatch(sellTokenAddress, WRAPPED_ASSET[chainId]) &&
    isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS_AGGREGATORS);

  // Wrap / Unwrap Eth
  if (isWrapNativeAsset || isUnwrapNativeAsset) {
    const default_estimate = isWrapNativeAsset
      ? ethUnits.weth_wrap
      : ethUnits.weth_unwrap;
    try {
      const gasLimit = await estimateGasWithPadding({
        transactionRequest: {
          from: tradeDetails.from,
          value: isWrapNativeAsset ? tradeDetails.buyAmount : '0',
        },
        contractCallEstimateGas: getWrappedAssetMethod(
          isWrapNativeAsset ? 'deposit' : 'withdraw',
          provider as StaticJsonRpcProvider,
          chainId,
        ),
        provider,
        paddingFactor: WRAP_GAS_PADDING,
      });

      return (
        gasLimit ||
        String(tradeDetails?.defaultGasLimit) ||
        String(default_estimate)
      );
    } catch (e) {
      return String(tradeDetails?.defaultGasLimit) || String(default_estimate);
    }
    // Swap
  } else {
    try {
      const { params, method, methodArgs } = getQuoteExecutionDetails(
        tradeDetails,
        { from: tradeDetails.from },
        provider as StaticJsonRpcProvider,
      );

      if (requiresApprove) {
        if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
          try {
            const gasLimitWithFakeApproval =
              await estimateSwapGasLimitWithFakeApproval(
                chainId,
                provider,
                tradeDetails,
              );
            return gasLimitWithFakeApproval;
          } catch (e) {
            //
          }
        }

        return getDefaultGasLimitForTrade(tradeDetails, chainId);
      }

      const gasLimit = await estimateGasWithPadding({
        transactionRequest: params,
        contractCallEstimateGas: method,
        callArguments: methodArgs,
        provider,
        paddingFactor: SWAP_GAS_PADDING,
      });

      return gasLimit || getDefaultGasLimitForTrade(tradeDetails, chainId);
    } catch (error) {
      return getDefaultGasLimitForTrade(tradeDetails, chainId);
    }
  }
};

export const executeSwap = async ({
  chainId,
  gasLimit,
  nonce,
  tradeDetails,
  transactionGasParams,
  wallet,
  permit = false,
}: {
  chainId: Chain['id'];
  gasLimit: string;
  transactionGasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  tradeDetails: Quote;
  wallet: Wallet;
  permit: boolean;
}) => {
  if (!wallet || !tradeDetails) return null;

  const { sellTokenAddress, buyTokenAddress } = tradeDetails;
  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(`${nonce}`) : undefined,
    ...transactionGasParams,
  };

  // Wrap Eth
  if (
    sellTokenAddress === ETH_ADDRESS &&
    buyTokenAddress === WRAPPED_ASSET[chainId]
  ) {
    return wrapNativeAsset(
      tradeDetails.buyAmount,
      wallet,
      chainId,
      transactionParams,
    );
    // Unwrap Weth
  } else if (
    sellTokenAddress === WRAPPED_ASSET[chainId] &&
    buyTokenAddress === ETH_ADDRESS
  ) {
    return unwrapNativeAsset(
      tradeDetails.sellAmount,
      wallet,
      chainId,
      transactionParams,
    );
    // Swap
  } else {
    return fillQuote(tradeDetails, transactionParams, wallet, permit, chainId);
  }
};

export const swap = async ({
  currentRap,
  wallet,
  index,
  parameters,
  baseNonce,
}: {
  wallet: Wallet;
  index: number;
  parameters: RapSwapActionParameters;
  baseNonce?: number;
  currentRap: Rap;
}): Promise<number | undefined> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  const { inputAmount, tradeDetails, permit, chainId, requiresApprove } =
    parameters;

  let gasParams = selectedGas.transactionGasParams;
  // if swap isn't the last action, use fast gas or custom (whatever is faster)

  if (currentRap.actions.length - 1 > index) {
    gasParams = overrideWithFastSpeedIfNeeded({
      selectedGas,
      chainId,
      gasFeeParamsBySpeed,
    });
  }

  let gasLimit;

  try {
    gasLimit = await estimateSwapGasLimit({
      chainId,
      requiresApprove,
      tradeDetails,
    });
  } catch (e) {
    logger.error({
      name: 'swap: error estimateSwapGasLimit',
      message: (e as Error).message,
    });
    throw e;
  }

  let swap;
  try {
    const nonce = baseNonce ? baseNonce + index : undefined;

    const swapParams = {
      transactionGasParams: gasParams,
      chainId,
      gasLimit,
      nonce,
      permit: !!permit,
      tradeDetails,
      wallet,
    };

    swap = await executeSwap(swapParams);
  } catch (e) {
    logger.error({
      name: 'swap: error executeSwap',
      message: (e as Error).message,
    });
    throw e;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newTransaction = {
    ...gasParams,
    amount: inputAmount,
    data: swap?.data,
    from: tradeDetails.from,
    gasLimit,
    hash: swap?.hash ?? null,
    chainId,
    nonce: swap?.nonce ?? null,
    protocol: ProtocolType.rainbow,
    status: TransactionStatus.swapping,
    to: swap?.to ?? null,
    type: TransactionType.trade,
    value: (swap && toHex(swap.value.toString())) || undefined,
  };

  return swap?.nonce;
};
