import {
  BatchCall,
  CrosschainQuote,
  Quote,
  TransactionOptions,
  getTargetAddress,
  prepareFillQuote,
} from '@rainbow-me/swaps';
import {
  Address,
  PublicClient,
  encodeFunctionData,
  erc20Abi,
  maxUint256,
  numberToHex,
  toHex as viemToHex,
} from 'viem';
import { mainnet } from 'viem/chains';

import { useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { RainbowError } from '~/logger';

import { ChainId } from '../types/chains';
import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../types/gas';

export const CHAIN_IDS_WITH_TRACE_SUPPORT = [mainnet.id];
export const SWAP_GAS_PADDING = 1.1;

export const toTransactionOptions = ({
  gasLimit,
  gasParams,
  nonce,
}: {
  gasLimit: bigint;
  gasParams: TransactionGasParams | TransactionLegacyGasParams;
  nonce?: number;
}): TransactionOptions => ({
  gasLimit: gasLimit ? gasLimit.toString() : undefined,
  nonce: nonce ? numberToHex(nonce) : undefined,
  ...('gasPrice' in gasParams
    ? { gasPrice: gasParams.gasPrice.toString() }
    : {
        maxFeePerGas: gasParams.maxFeePerGas.toString(),
        maxPriorityFeePerGas: gasParams.maxPriorityFeePerGas.toString(),
      }),
});

export const deserializeGasParams = (
  serialized: Record<string, string> | undefined,
): TransactionGasParams | TransactionLegacyGasParams | undefined => {
  if (!serialized || typeof serialized !== 'object') return undefined;
  if ('gasPrice' in serialized && serialized.gasPrice) {
    return { gasPrice: BigInt(serialized.gasPrice) };
  }
  if (
    'maxFeePerGas' in serialized &&
    'maxPriorityFeePerGas' in serialized &&
    serialized.maxFeePerGas &&
    serialized.maxPriorityFeePerGas
  ) {
    return {
      maxFeePerGas: BigInt(serialized.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(serialized.maxPriorityFeePerGas),
    };
  }
  return undefined;
};

export const isValidGasParams = (
  params: TransactionGasParams | TransactionLegacyGasParams | undefined,
): params is TransactionGasParams | TransactionLegacyGasParams => {
  if (!params || typeof params !== 'object') return false;
  if ('gasPrice' in params) return params.gasPrice != null;
  return (
    'maxFeePerGas' in params &&
    params.maxFeePerGas != null &&
    'maxPriorityFeePerGas' in params &&
    params.maxPriorityFeePerGas != null
  );
};

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export const waitForGasParams = async (
  maxAttempts = 10,
): Promise<TransactionGasParams | TransactionLegacyGasParams> => {
  for (let i = 0; i < maxAttempts; i++) {
    const { selectedGas } = useGasStore.getState();
    if (selectedGas && isValidGasParams(selectedGas.transactionGasParams)) {
      return selectedGas.transactionGasParams;
    }
    // eslint-disable-next-line no-await-in-loop
    await delay(200);
  }
  throw new RainbowError(
    'swap: gas params not available after waiting for store sync',
  );
};

const GAS_LIMIT_INCREMENT = 50000;
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
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed | null;
}): TransactionGasParams | TransactionLegacyGasParams => {
  const gasParams = selectedGas.transactionGasParams;

  if (chainId === ChainId.mainnet && 'maxFeePerGas' in gasParams) {
    const fast = gasFeeParamsBySpeed?.fast?.transactionGasParams;
    if (!fast || !('maxFeePerGas' in fast)) return gasParams;

    const maxFee =
      !gasParams.maxFeePerGas || fast.maxFeePerGas > gasParams.maxFeePerGas
        ? fast.maxFeePerGas
        : gasParams.maxFeePerGas;
    const maxPriority =
      !gasParams.maxPriorityFeePerGas ||
      fast.maxPriorityFeePerGas > gasParams.maxPriorityFeePerGas
        ? fast.maxPriorityFeePerGas
        : gasParams.maxPriorityFeePerGas;

    return { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority };
  }

  if (chainId === ChainId.polygon && 'gasPrice' in gasParams) {
    const fast = gasFeeParamsBySpeed?.fast?.transactionGasParams;
    if (!fast || !('gasPrice' in fast)) return gasParams;

    if (!gasParams.gasPrice || fast.gasPrice > gasParams.gasPrice) {
      return { gasPrice: fast.gasPrice };
    }
  }

  return gasParams;
};

const getStateDiff = async (
  client: PublicClient,
  quote: Quote | CrosschainQuote,
): Promise<unknown> => {
  const tokenAddress = quote.sellTokenAddress;
  const fromAddr = quote.from;
  const toAddr =
    quote.swapType === 'normal'
      ? getTargetAddressForQuote(quote)
      : (quote as CrosschainQuote).allowanceTarget;
  const block = await client.getBlock();
  const blockNumber = Number(block.number);

  let data: string;

  if (quote.fallback && quote.data) {
    data = quote.data as string;
  } else {
    data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [toAddr as Address, maxUint256],
    });
  }

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

  const trace = await client.request({
    method: 'trace_call' as never,
    params: callParams as never,
  });

  type StateDiffResponse = {
    stateDiff?: Record<string, { storage: Record<string, unknown> }>;
  };
  if ((trace as StateDiffResponse).stateDiff) {
    const stateDiff = (trace as StateDiffResponse).stateDiff!;
    const slotAddress = Object.keys(stateDiff[tokenAddress]?.storage)?.[0];
    if (slotAddress) {
      const formattedStateDiff = {
        [tokenAddress]: {
          stateDiff: {
            [slotAddress]: viemToHex(maxUint256),
          },
        },
      };
      return formattedStateDiff;
    }
  }
};

const getClosestGasEstimate = async (
  estimationFn: (gasEstimate: number) => Promise<boolean>,
): Promise<bigint> => {
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
      return BigInt(gasEstimates[lowestSuccessfulGuess]);
    }

    if (highestFailedGuess === gasEstimates.length - 1) {
      return -1n;
    }
  }
  return -1n;
};

export const getDefaultGasLimitForTrade = (
  quote: Quote,
  chainId: ChainId,
): bigint => {
  const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
  return quote?.defaultGasLimit
    ? BigInt(quote.defaultGasLimit)
    : (BigInt(chainGasUnits.basic.swap) * 3n) / 2n;
};

export const estimateSwapGasLimitWithFakeApproval = async (
  chainId: number,
  client: PublicClient,
  quote: Quote | CrosschainQuote,
): Promise<bigint> => {
  let stateDiff: unknown;

  try {
    stateDiff = await getStateDiff(client, quote);
    const batchCall = await prepareFillQuote(
      quote as Quote,
      { from: quote.from },
      false,
      chainId,
    );

    const gasLimit = await getClosestGasEstimate(async (gas: number) => {
      const callParams = [
        {
          data: batchCall.data,
          from: quote.from,
          gas: numberToHex(BigInt(gas)),
          gasPrice: numberToHex(100000000000n),
          to: batchCall.to,
          value: '0x0',
        },
        'latest',
      ];

      try {
        await client.request({
          method: 'eth_call' as never,
          params: [...callParams, stateDiff] as never,
        });
        return true;
      } catch (e) {
        return false;
      }
    });
    const chainGasUnits = useNetworkStore.getState().getChainGasUnits(chainId);
    if (gasLimit > 0n && gasLimit > BigInt(chainGasUnits.basic.swap)) {
      return gasLimit;
    }
  } catch (e) {
    //
  }
  return getDefaultGasLimitForTrade(quote, chainId);
};

export const populateSwap = async ({
  quote,
}: {
  quote: Quote | CrosschainQuote;
}): Promise<BatchCall | null> => {
  try {
    const batchCall = await prepareFillQuote(
      quote as Quote,
      { from: quote.from },
      false,
      quote.chainId,
    );
    return batchCall;
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
