import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  ALLOWS_PERMIT,
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
import { Chain, chain } from 'wagmi';

import { logger } from '~/logger';

import { ETH_ADDRESS, ethUnits } from '../references';
import { gasStore } from '../state';
import { bsc } from '../types/chains';
import { TransactionGasParams, TransactionLegacyGasParams } from '../types/gas';
import { estimateGasWithPadding } from '../utils/gas';
import { multiply, toHex } from '../utils/numbers';

import { Rap, RapExchangeActionParameters } from './common';
import { getFastSpeedByDefault } from './utils';

// const GAS_LIMIT_INCREMENT = 50000;
const EXTRA_GAS_PADDING = 1.5;
const SWAP_GAS_PADDING = 1.1;
const WRAP_GAS_PADDING = 1.002;
// const CHAIN_IDS_WITH_TRACE_SUPPORT = [chain.mainnet.id];

const getBasicSwapGasLimit = (chainId: Chain['id']): string => {
  switch (chainId) {
    case chain.arbitrum.id:
      return `${ethUnits.basic_swap_arbitrum}`;
    case chain.polygon.id:
      return `${ethUnits.basic_swap_polygon}`;
    case bsc.id:
      return `${ethUnits.basic_swap_bsc}`;
    case chain.optimism.id:
      return `${ethUnits.basic_swap_optimism}`;
    default:
      return `${ethUnits.basic_swap}`;
  }
};

export const getDefaultGasLimitForTrade = (
  tradeDetails: Quote,
  chainId: Chain['id'],
): string => {
  const allowsPermit =
    chainId === chain.mainnet.id &&
    ALLOWS_PERMIT[tradeDetails?.sellTokenAddress?.toLowerCase()];

  let defaultGasLimit = tradeDetails?.defaultGasLimit;

  if (allowsPermit) {
    defaultGasLimit = Math.max(
      Number(defaultGasLimit),
      Number(multiply(ethUnits.basic_swap_permit, EXTRA_GAS_PADDING)),
    ).toString();
  }
  return (
    defaultGasLimit ||
    multiply(getBasicSwapGasLimit(chainId), EXTRA_GAS_PADDING)
  );
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
    return getBasicSwapGasLimit(Number(chainId));
  }
  const { sellTokenAddress, buyTokenAddress } = tradeDetails;
  const isWrapNativeAsset =
    sellTokenAddress === ETH_ADDRESS_AGGREGATORS &&
    buyTokenAddress === WRAPPED_ASSET[chainId];
  const isUnwrapNativeAsset =
    sellTokenAddress === WRAPPED_ASSET[chainId] &&
    buyTokenAddress === ETH_ADDRESS_AGGREGATORS;

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
        // TODO trace support gas
        // if (CHAIN_IDS_WITH_TRACE_SUPPORT.includes(chainId)) {
        //   try {
        //     const gasLimitWithFakeApproval =
        //       await getSwapGasLimitWithFakeApproval(
        //         chainId,
        //         provider,
        //         tradeDetails,
        //       );
        //     return gasLimitWithFakeApproval;
        //   } catch (e) {
        //     //
        //   }
        // }

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

export const swap = async ({
  currentRap,
  wallet,
  index,
  parameters,
  baseNonce,
}: {
  wallet: Wallet;
  index: number;
  parameters: RapExchangeActionParameters;
  baseNonce?: number;
  currentRap: Rap;
}): Promise<number | undefined> => {
  const { tradeDetails, permit, chainId, requiresApprove } = parameters;
  const { selectedGas, gasFeeParamsBySpeed } = gasStore.getState();

  let gasParams = selectedGas.transactionGasParams;
  // if swap isn't the last action, use fast gas or custom (whatever is faster)

  if (currentRap.actions.length - 1 > index) {
    gasParams = getFastSpeedByDefault({
      selectedGas,
      chainId,
      gasFeeParamsBySpeed,
    });
  }

  const gasLimit = await estimateSwapGasLimit({
    chainId,
    requiresApprove,
    tradeDetails,
  });

  let swap;
  try {
    const nonce = baseNonce ? baseNonce + index : undefined;

    const swapParams = {
      transactionGasParams: gasParams,
      chainId,
      flashbots: !!parameters.flashbots,
      gasLimit,
      nonce,
      permit: !!permit,
      tradeDetails,
      wallet,
    };

    swap = await executeSwap(swapParams);

    // if (permit) {
    //   // Clear the allowance
    //   const cacheKey = toLower(
    //     `${wallet.address}|${tradeDetails.sellTokenAddress}|${tradeDetails.to}`,
    //   );
    //   // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    //   delete AllowancesCache.cache[cacheKey];
    // }
  } catch (e) {
    logger.error(e as Error);
    throw e;
  }

  //   const newTransaction = {
  //     ...gasParams,
  //     amount: inputAmount,
  //     asset: inputCurrency,
  //     data: swap?.data,
  //     flashbots: parameters.flashbots,
  //     from: accountAddress,
  //     gasLimit,
  //     hash: swap?.hash ?? null,
  //     network: ethereumUtils.getNetworkFromChainId(Number(chainId)),
  //     nonce: swap?.nonce ?? null,
  //     protocol: ProtocolType.uniswap,
  //     status: TransactionStatus.swapping,
  //     to: swap?.to ?? null,
  //     type: TransactionType.trade,
  //     value: (swap && toHex(swap.value)) || undefined,
  //   };
  //   logger.log(`[${actionName}] adding new txn`, newTransaction);

  return swap?.nonce;
};
