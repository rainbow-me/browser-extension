import { Signer } from '@ethersproject/abstract-signer';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Transaction } from '@ethersproject/transactions';
import {
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  ChainId as SwapChainId,
  WRAPPED_ASSET,
  fillQuote,
  getQuoteExecutionDetails,
  getWrappedAssetMethod,
  unwrapNativeAsset,
  wrapNativeAsset,
} from '@rainbow-me/swaps';
import { Address, getProvider } from '@wagmi/core';

import { ChainId } from '~/core/types/chains';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { addNewTransaction } from '~/core/utils/transactions';
import { logger } from '~/logger';

import { ETH_ADDRESS, gasUnits } from '../../references';
import { gasStore } from '../../state';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../../types/gas';
import { estimateGasWithPadding } from '../../utils/gas';
import { toHex } from '../../utils/numbers';
import { ActionProps } from '../references';
import {
  CHAIN_IDS_WITH_TRACE_SUPPORT,
  SWAP_GAS_PADDING,
  estimateSwapGasLimitWithFakeApproval,
  getDefaultGasLimitForTrade,
  overrideWithFastSpeedIfNeeded,
} from '../utils';

const WRAP_GAS_PADDING = 1.002;

export const estimateSwapGasLimit = async ({
  chainId,
  requiresApprove,
  quote,
}: {
  chainId: ChainId;
  requiresApprove?: boolean;
  quote: Quote;
}): Promise<string> => {
  const provider = getProvider({ chainId });
  if (!provider || !quote) {
    return gasUnits.basic_swap[chainId];
  }

  const { sellTokenAddress, buyTokenAddress } = quote;
  const isWrapNativeAsset =
    isLowerCaseMatch(sellTokenAddress, ETH_ADDRESS_AGGREGATORS) &&
    isLowerCaseMatch(buyTokenAddress, WRAPPED_ASSET[chainId]);

  const isUnwrapNativeAsset =
    isLowerCaseMatch(sellTokenAddress, WRAPPED_ASSET[chainId]) &&
    isLowerCaseMatch(buyTokenAddress, ETH_ADDRESS_AGGREGATORS);

  // Wrap / Unwrap Eth
  if (isWrapNativeAsset || isUnwrapNativeAsset) {
    const default_estimate = isWrapNativeAsset
      ? gasUnits.weth_wrap
      : gasUnits.weth_unwrap;
    try {
      const gasLimit = await estimateGasWithPadding({
        transactionRequest: {
          from: quote.from,
          value: isWrapNativeAsset ? quote.buyAmount : '0',
        },
        contractCallEstimateGas: getWrappedAssetMethod(
          isWrapNativeAsset ? 'deposit' : 'withdraw',
          provider as StaticJsonRpcProvider,
          chainId as unknown as SwapChainId,
        ),
        provider,
        paddingFactor: WRAP_GAS_PADDING,
      });

      return (
        gasLimit || String(quote?.defaultGasLimit) || String(default_estimate)
      );
    } catch (e) {
      return String(quote?.defaultGasLimit) || String(default_estimate);
    }
    // Swap
  } else {
    try {
      const { params, method, methodArgs } = getQuoteExecutionDetails(
        quote,
        { from: quote.from },
        provider as StaticJsonRpcProvider,
      );

      if (requiresApprove) {
        if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
          try {
            const gasLimitWithFakeApproval =
              await estimateSwapGasLimitWithFakeApproval(
                chainId,
                provider,
                quote,
              );
            return gasLimitWithFakeApproval;
          } catch (e) {
            //
          }
        }

        return getDefaultGasLimitForTrade(quote, chainId);
      }

      const gasLimit = await estimateGasWithPadding({
        transactionRequest: params,
        contractCallEstimateGas: method,
        callArguments: methodArgs,
        provider,
        paddingFactor: SWAP_GAS_PADDING,
      });

      return gasLimit || getDefaultGasLimitForTrade(quote, chainId);
    } catch (error) {
      return getDefaultGasLimitForTrade(quote, chainId);
    }
  }
};

export const executeSwap = async ({
  chainId,
  gasLimit,
  nonce,
  quote,
  gasParams,
  wallet,
  permit = false,
}: {
  chainId: ChainId;
  gasLimit: string;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
  quote: Quote;
  wallet: Signer;
  permit: boolean;
}): Promise<Transaction | null> => {
  if (!wallet || !quote) return null;

  const { sellTokenAddress, buyTokenAddress } = quote;
  const transactionParams = {
    gasLimit: toHex(gasLimit) || undefined,
    nonce: nonce ? toHex(`${nonce}`) : undefined,
    ...gasParams,
  };

  // Wrap Eth
  if (
    sellTokenAddress === ETH_ADDRESS &&
    buyTokenAddress === WRAPPED_ASSET[chainId]
  ) {
    return wrapNativeAsset(
      quote.buyAmount,
      wallet,
      chainId as unknown as SwapChainId,
      transactionParams,
    );
    // Unwrap Weth
  } else if (
    sellTokenAddress === WRAPPED_ASSET[chainId] &&
    buyTokenAddress === ETH_ADDRESS
  ) {
    return unwrapNativeAsset(
      quote.sellAmount,
      wallet,
      chainId as unknown as SwapChainId,
      transactionParams,
    );
    // Swap
  } else {
    return fillQuote(
      quote,
      transactionParams,
      wallet,
      permit,
      chainId as unknown as SwapChainId,
    );
  }
};

export const swap = async ({
  currentRap,
  wallet,
  index,
  parameters,
  baseNonce,
}: ActionProps<'swap'>): Promise<number | undefined> => {
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  const { quote, permit, chainId, requiresApprove } = parameters;
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
      quote,
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
      gasParams,
      chainId,
      gasLimit,
      nonce,
      permit: !!permit,
      quote,
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

  const transaction = {
    amount: '0',
    asset: parameters.assetToSell,
    data: parameters.quote.data,
    value: parameters.quote.value,
    from: parameters.quote.from as Address,
    to: parameters.quote.to as Address,
    hash: swap?.hash,
    chainId: parameters.chainId,
    nonce: swap?.nonce,
    status: TransactionStatus.swapping,
    type: TransactionType.trade,
  };
  await addNewTransaction({
    address: parameters.quote.from as Address,
    chainId: parameters.chainId as ChainId,
    transaction,
  });

  return swap?.nonce;
};
