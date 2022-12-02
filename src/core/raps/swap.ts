import { Block, Provider } from '@ethersproject/abstract-provider';
import { MaxUint256 } from '@ethersproject/constants';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  ALLOWS_PERMIT,
  ETH_ADDRESS as ETH_ADDRESS_AGGREGATORS,
  Quote,
  RAINBOW_ROUTER_CONTRACT_ADDRESS,
  WRAPPED_ASSET,
  fillQuote,
  getQuoteExecutionDetails,
  getWrappedAssetMethod,
  unwrapNativeAsset,
  wrapNativeAsset,
} from '@rainbow-me/swaps';
import { erc20ABI, getProvider } from '@wagmi/core';
import { Contract, Wallet } from 'ethers';
import { Chain, chain } from 'wagmi';

import { logger } from '~/logger';

import { ETH_ADDRESS, ethUnits } from '../references';
import { gasStore } from '../state';
import { bsc } from '../types/chains';
import { TransactionGasParams, TransactionLegacyGasParams } from '../types/gas';
import {
  ProtocolType,
  TransactionStatus,
  TransactionType,
} from '../types/transactions';
import { estimateGasWithPadding } from '../utils/gas';
import {
  greaterThan,
  multiply,
  toHex,
  toHexNoLeadingZeros,
} from '../utils/numbers';

import { Rap, RapExchangeActionParameters } from './common';
import { overrideWithFastSpeedIfNeeded } from './utils';

const GAS_LIMIT_INCREMENT = 50000;
const EXTRA_GAS_PADDING = 1.5;
const SWAP_GAS_PADDING = 1.1;
const WRAP_GAS_PADDING = 1.002;
const CHAIN_IDS_WITH_TRACE_SUPPORT = [chain.mainnet.id];
const TRACE_CALL_BLOCK_NUMBER_OFFSET = 20;

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

const getStateDiff = async (
  provider: Provider,
  tradeDetails: Quote,
): Promise<unknown> => {
  const tokenAddress = tradeDetails.sellTokenAddress;
  const fromAddr = tradeDetails.from;
  const toAddr = RAINBOW_ROUTER_CONTRACT_ADDRESS;
  const tokenContract = new Contract(tokenAddress, erc20ABI, provider);

  const { number: blockNumber } = await (
    provider.getBlock as () => Promise<Block>
  )();

  // Get data
  const { data } = await tokenContract.populateTransaction.approve(
    toAddr,
    MaxUint256.toHexString(),
  );

  // trace_call default params
  const callParams = [
    {
      data,
      from: fromAddr,
      to: tokenAddress,
      value: '0x0',
    },
    ['stateDiff'],
    blockNumber - TRACE_CALL_BLOCK_NUMBER_OFFSET,
  ];

  const trace = await (provider as StaticJsonRpcProvider).send(
    'trace_call',
    callParams,
  );

  if (trace.stateDiff) {
    const slotAddress = Object.keys(
      trace.stateDiff[tokenAddress]?.storage,
    )?.[0];
    if (slotAddress) {
      const formattedStateDiff = {
        [tokenAddress]: {
          stateDiff: {
            [slotAddress]: MaxUint256.toHexString(),
          },
        },
      };
      return formattedStateDiff;
    }
  }
};

const getClosestGasEstimate = async (
  estimationFn: (gasEstimate: number) => Promise<boolean>,
): Promise<string> => {
  // From 200k to 1M
  const gasEstimates = Array.from(Array(21).keys())
    .filter((x) => x > 3)
    .map((x) => x * GAS_LIMIT_INCREMENT);

  let start = 0;
  let end = gasEstimates.length - 1;

  let highestFailedGuess = null;
  let lowestSuccessfulGuess = null;
  let lowestFailureGuess = null;
  // guess is typically middle of array
  let guessIndex = Math.floor((end - start) / 2);
  while (end > start) {
    // eslint-disable-next-line no-await-in-loop
    const gasEstimationSucceded = await estimationFn(gasEstimates[guessIndex]);
    if (gasEstimationSucceded) {
      if (!lowestSuccessfulGuess || guessIndex < lowestSuccessfulGuess) {
        lowestSuccessfulGuess = guessIndex;
      }
      end = guessIndex;
      guessIndex = Math.max(
        Math.floor((end + start) / 2) - 1,
        highestFailedGuess || 0,
      );
    } else if (!gasEstimationSucceded) {
      if (!highestFailedGuess || guessIndex > highestFailedGuess) {
        highestFailedGuess = guessIndex;
      }
      if (!lowestFailureGuess || guessIndex < lowestFailureGuess) {
        lowestFailureGuess = guessIndex;
      }
      start = guessIndex;
      guessIndex = Math.ceil((end + start) / 2);
    }

    if (
      (highestFailedGuess !== null &&
        highestFailedGuess + 1 === lowestSuccessfulGuess) ||
      lowestSuccessfulGuess === 0 ||
      (lowestSuccessfulGuess !== null &&
        lowestFailureGuess === lowestSuccessfulGuess - 1)
    ) {
      return String(gasEstimates[lowestSuccessfulGuess]);
    }

    if (highestFailedGuess === gasEstimates.length - 1) {
      return '-1';
    }
  }
  return '-1';
};

const getDefaultGasLimitForTrade = (
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

const estimateSwapGasLimitWithFakeApproval = async (
  chainId: number,
  provider: Provider,
  tradeDetails: Quote,
): Promise<string> => {
  let stateDiff: unknown;

  try {
    stateDiff = await getStateDiff(provider, tradeDetails);
    const { router, methodName, params, methodArgs } = getQuoteExecutionDetails(
      tradeDetails,
      { from: tradeDetails.from },
      provider as StaticJsonRpcProvider,
    );

    const { data } = await router.populateTransaction[methodName](
      ...(methodArgs ?? []),
      params,
    );

    const gasLimit = await getClosestGasEstimate(async (gas: number) => {
      const callParams = [
        {
          data,
          from: tradeDetails.from,
          gas: toHexNoLeadingZeros(String(gas)),
          gasPrice: toHexNoLeadingZeros(`100000000000`),
          to: RAINBOW_ROUTER_CONTRACT_ADDRESS,
          value: '0x0', // 100 gwei
        },
        'latest',
      ];

      try {
        await (provider as StaticJsonRpcProvider).send('eth_call', [
          ...callParams,
          stateDiff,
        ]);
        return true;
      } catch (e) {
        return false;
      }
    });
    if (gasLimit && greaterThan(gasLimit, ethUnits.basic_swap)) {
      return gasLimit;
    }
  } catch (e) {
    //
  }
  return getDefaultGasLimitForTrade(tradeDetails, chainId);
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
  parameters: RapExchangeActionParameters;
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
  } catch (e) {
    logger.error(e as Error);
    throw e;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const newTransaction = {
    ...gasParams,
    amount: inputAmount,
    data: swap?.data,
    flashbots: parameters.flashbots,
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
