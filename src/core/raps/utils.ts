import { Block, Provider } from '@ethersproject/abstract-provider';
import { MaxUint256 } from '@ethersproject/constants';
import { Contract, PopulatedTransaction } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  CrosschainQuote,
  Quote,
  getQuoteExecutionDetails,
  getTargetAddress,
} from '@rainbow-me/swaps';
import { Address, erc20Abi } from 'viem';
import { mainnet } from 'viem/chains';

import { useNetworkStore } from '~/core/state/networks/networks';

import { ChainId } from '../types/chains';
import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../types/gas';
import { toHexNoLeadingZeros } from '../utils/hex';
import { greaterThan, multiply } from '../utils/numbers';

export const CHAIN_IDS_WITH_TRACE_SUPPORT = [mainnet.id];
export const SWAP_GAS_PADDING = 1.1;

const GAS_LIMIT_INCREMENT = 50000;
const EXTRA_GAS_PADDING = 1.5;
const TRACE_CALL_BLOCK_NUMBER_OFFSET = 20;

/**
 * If gas price is not defined, override with fast speed
 */
export const overrideWithFastSpeedIfNeeded = ({
  selectedGas,
  chainId,
  gasFeeParamsBySpeed,
}: {
  selectedGas: GasFeeParams | GasFeeLegacyParams;
  chainId: ChainId;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
}) => {
  const gasParams = selectedGas.transactionGasParams;
  // approvals should always use fast gas or custom (whatever is faster)
  if (chainId === ChainId.mainnet) {
    const transactionGasParams = gasParams as TransactionGasParams;
    if (
      !transactionGasParams.maxFeePerGas ||
      !transactionGasParams.maxPriorityFeePerGas
    ) {
      const fastTransactionGasParams = gasFeeParamsBySpeed?.fast
        ?.transactionGasParams as TransactionGasParams;

      if (
        greaterThan(
          fastTransactionGasParams.maxFeePerGas,
          transactionGasParams?.maxFeePerGas || 0,
        )
      ) {
        (gasParams as TransactionGasParams).maxFeePerGas =
          fastTransactionGasParams.maxFeePerGas;
      }
      if (
        greaterThan(
          fastTransactionGasParams.maxPriorityFeePerGas,
          transactionGasParams?.maxPriorityFeePerGas || 0,
        )
      ) {
        (gasParams as TransactionGasParams).maxPriorityFeePerGas =
          fastTransactionGasParams.maxPriorityFeePerGas;
      }
    }
  } else if (chainId === ChainId.polygon) {
    const transactionGasParams = gasParams as TransactionLegacyGasParams;
    if (!transactionGasParams.gasPrice) {
      const fastGasPrice = (
        gasFeeParamsBySpeed?.fast
          ?.transactionGasParams as TransactionLegacyGasParams
      ).gasPrice;

      if (greaterThan(fastGasPrice, transactionGasParams?.gasPrice || 0)) {
        (gasParams as TransactionLegacyGasParams).gasPrice = fastGasPrice;
      }
    }
  }
  return gasParams;
};

const getStateDiff = async (
  provider: Provider,
  quote: Quote | CrosschainQuote,
): Promise<unknown> => {
  const tokenAddress = quote.sellTokenAddress;
  const fromAddr = quote.from;
  const toAddr =
    quote.swapType === 'normal'
      ? getTargetAddressForQuote(quote)
      : (quote as CrosschainQuote).allowanceTarget;
  const tokenContract = new Contract(tokenAddress, erc20Abi, provider);

  const { number: blockNumber } = await (
    provider.getBlock as () => Promise<Block>
  )();

  let data: string;

  if (quote.fallback && quote.data) {
    data = quote.data;
  } else {
    const result = await tokenContract.populateTransaction.approve(
      toAddr,
      MaxUint256.toHexString(),
    );
    if (!result.data) {
      return;
    }
    data = result.data;
  }

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

export const getDefaultGasLimitForTrade = (
  quote: Quote,
  chainId: ChainId,
): string => {
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  return (
    quote?.defaultGasLimit ||
    multiply(chainGasUnits.basic.swap, EXTRA_GAS_PADDING)
  );
};

export const estimateSwapGasLimitWithFakeApproval = async (
  chainId: number,
  provider: Provider,
  quote: Quote | CrosschainQuote,
): Promise<string> => {
  let stateDiff: unknown;

  try {
    stateDiff = await getStateDiff(provider, quote);
    const { router, methodName, params, methodArgs } = getQuoteExecutionDetails(
      quote,
      { from: quote.from },
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
          from: quote.from,
          gas: toHexNoLeadingZeros(String(gas)),
          gasPrice: toHexNoLeadingZeros(`100000000000`),
          to:
            quote.swapType === 'normal'
              ? getTargetAddressForQuote(quote)
              : (quote as CrosschainQuote).allowanceTarget,
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
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    if (gasLimit && greaterThan(gasLimit, chainGasUnits.basic.swap)) {
      return gasLimit;
    }
  } catch (e) {
    //
  }
  return getDefaultGasLimitForTrade(quote, chainId);
};

export const populateSwap = async ({
  provider,
  quote,
}: {
  provider: Provider;
  quote: Quote | CrosschainQuote;
}): Promise<PopulatedTransaction | null> => {
  try {
    const { router, methodName, params, methodArgs } = getQuoteExecutionDetails(
      quote,
      { from: quote.from },
      provider as StaticJsonRpcProvider,
    );
    const swapTransaction = await router.populateTransaction[methodName](
      ...(methodArgs ?? []),
      params,
    );
    return swapTransaction;
  } catch (e) {
    return null;
  }
};

export const getTargetAddressForQuote = (quote: Quote | CrosschainQuote) => {
  const targetAddress = getTargetAddress(quote);
  if (!targetAddress) {
    throw new Error('Target address not found for quote');
  }
  return targetAddress as Address;
};
