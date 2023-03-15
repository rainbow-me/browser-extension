import { Block, Provider } from '@ethersproject/abstract-provider';
import { MaxUint256 } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import {
  ALLOWS_PERMIT,
  Quote,
  RAINBOW_ROUTER_CONTRACT_ADDRESS,
  getQuoteExecutionDetails,
} from '@rainbow-me/swaps';
import { Chain, chain, erc20ABI } from 'wagmi';

import { gasUnits } from '../references';
import { ChainId } from '../types/chains';
import {
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '../types/gas';
import { greaterThan, multiply, toHexNoLeadingZeros } from '../utils/numbers';

export const CHAIN_IDS_WITH_TRACE_SUPPORT = [chain.mainnet.id];
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
  chainId: Chain['id'];
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed;
}) => {
  const gasParams = selectedGas.transactionGasParams;
  // approvals should always use fast gas or custom (whatever is faster)
  if (chainId === chain.mainnet.id) {
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
  } else if (chainId === chain.polygon.id) {
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
      Number(multiply(gasUnits.basic_swap_permit, EXTRA_GAS_PADDING)),
    ).toString();
  }
  return (
    defaultGasLimit || multiply(gasUnits.basic_swap[chainId], EXTRA_GAS_PADDING)
  );
};

export const estimateSwapGasLimitWithFakeApproval = async (
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
    if (
      gasLimit &&
      greaterThan(gasLimit, gasUnits.basic_swap[ChainId.mainnet])
    ) {
      return gasLimit;
    }
  } catch (e) {
    //
  }
  return getDefaultGasLimitForTrade(tradeDetails, chainId);
};
