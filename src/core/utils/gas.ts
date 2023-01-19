import {
  Block,
  Provider,
  TransactionRequest,
} from '@ethersproject/abstract-provider';
import { Contract } from '@ethersproject/contracts';
import { serialize } from '@ethersproject/transactions';
import BigNumber from 'bignumber.js';
import { BigNumberish } from 'ethers';
import { getAddress } from 'ethers/lib/utils';

import {
  OVM_GAS_PRICE_ORACLE,
  SupportedCurrencyKey,
  ethUnits,
  optimismGasOracleAbi,
  supportedCurrencies,
} from '../references';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '../resources/gas/meteorology';
import { ParsedAsset } from '../types/assets';
import { ChainId } from '../types/chains';
import {
  BlocksToConfirmation,
  GasFeeLegacyParams,
  GasFeeParam,
  GasFeeParams,
  GasSpeed,
} from '../types/gas';

import { addHexPrefix, gweiToWei, weiToGwei } from './ethereum';
import {
  add,
  addBuffer,
  convertAmountAndPriceToNativeDisplayWithThreshold,
  convertRawAmountToBalance,
  convertStringToHex,
  divide,
  fraction,
  greaterThan,
  lessThan,
  multiply,
  toHex,
} from './numbers';
import { getMinimalTimeUnitStringForMs } from './time';

export const parseGasDataConfirmationTime = (
  maxBaseFee: string,
  maxPriorityFee: string,
  blocksToConfirmation: BlocksToConfirmation,
) => {
  let blocksToWaitForPriorityFee = 0;
  let blocksToWaitForBaseFee = 0;
  const { byPriorityFee, byBaseFee } = blocksToConfirmation;

  if (lessThan(maxPriorityFee, divide(byPriorityFee[4], 2))) {
    blocksToWaitForPriorityFee += 240;
  } else if (lessThan(maxPriorityFee, byPriorityFee[4])) {
    blocksToWaitForPriorityFee += 4;
  } else if (lessThan(maxPriorityFee, byPriorityFee[3])) {
    blocksToWaitForPriorityFee += 3;
  } else if (lessThan(maxPriorityFee, byPriorityFee[2])) {
    blocksToWaitForPriorityFee += 2;
  } else if (lessThan(maxPriorityFee, byPriorityFee[1])) {
    blocksToWaitForPriorityFee += 1;
  }

  if (lessThan(byBaseFee[4], maxBaseFee)) {
    blocksToWaitForBaseFee += 1;
  } else if (lessThan(byBaseFee[8], maxBaseFee)) {
    blocksToWaitForBaseFee += 4;
  } else if (lessThan(byBaseFee[40], maxBaseFee)) {
    blocksToWaitForBaseFee += 8;
  } else if (lessThan(byBaseFee[120], maxBaseFee)) {
    blocksToWaitForBaseFee += 40;
  } else if (lessThan(byBaseFee[240], maxBaseFee)) {
    blocksToWaitForBaseFee += 120;
  } else {
    blocksToWaitForBaseFee += 240;
  }

  // 1 hour as max estimate, 240 blocks
  const totalBlocksToWait =
    blocksToWaitForBaseFee +
    (blocksToWaitForBaseFee < 240 ? blocksToWaitForPriorityFee : 0);
  const timeAmount = 15 * totalBlocksToWait;

  return {
    amount: timeAmount,
    display: getMinimalTimeUnitStringForMs(Number(multiply(timeAmount, 1000))),
  };
};

export const parseGasFeeParam = ({ wei }: { wei: string }): GasFeeParam => {
  const gwei = wei ? weiToGwei(wei) : '';
  console.log('--- parseGasFeeParam', wei, gwei);
  return {
    amount: wei,
    display: `${gwei} Gwei`,
    gwei,
  };
};

export const parseGasFeeParams = ({
  wei,
  currentBaseFee,
  speed,
  maxPriorityFeeSuggestions,
  blocksToConfirmation,
  gasLimit,
  nativeAsset,
  currency,
}: {
  wei: string;
  speed: GasSpeed;
  maxPriorityFeeSuggestions: {
    fast: string;
    urgent: string;
    normal: string;
  };
  currentBaseFee: string;
  gasLimit: string;
  nativeAsset?: ParsedAsset;
  blocksToConfirmation: BlocksToConfirmation;
  currency: SupportedCurrencyKey;
}): GasFeeParams => {
  const maxBaseFee = parseGasFeeParam({
    wei: new BigNumber(multiply(wei, getBaseFeeMultiplier(speed))).toFixed(0),
  });
  const maxPriorityFeePerGas = parseGasFeeParam({
    wei: maxPriorityFeeSuggestions[speed === 'custom' ? 'urgent' : speed],
  });

  const baseFee = lessThan(currentBaseFee, maxBaseFee.amount)
    ? currentBaseFee
    : maxBaseFee.amount;

  const display = `${new BigNumber(
    weiToGwei(add(baseFee, maxPriorityFeePerGas.amount)),
  ).toFixed(0)} - ${new BigNumber(
    weiToGwei(add(wei, maxPriorityFeePerGas.amount)),
  ).toFixed(0)} Gwei`;

  const estimatedTime = parseGasDataConfirmationTime(
    maxBaseFee.amount,
    maxPriorityFeePerGas.amount,
    blocksToConfirmation,
  );

  const transactionGasParams = {
    maxPriorityFeePerGas: addHexPrefix(
      convertStringToHex(maxPriorityFeePerGas.amount),
    ),
    maxFeePerGas: addHexPrefix(
      convertStringToHex(add(maxPriorityFeePerGas.amount, maxBaseFee.amount)),
    ),
  };

  const feeAmount = add(maxBaseFee.amount, maxPriorityFeePerGas.amount);
  const totalWei = multiply(gasLimit, feeAmount);
  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;
  const nativeDisplay = convertAmountAndPriceToNativeDisplayWithThreshold(
    nativeTotalWei,
    nativeAsset?.price?.value || 0,
    currency,
  );
  const gasFee = { amount: totalWei, display: nativeDisplay.display };

  return {
    display,
    estimatedTime,
    gasFee,
    maxBaseFee,
    maxPriorityFeePerGas,
    option: speed,
    transactionGasParams,
  };
};

export const parseGasFeeLegacyParams = ({
  gwei,
  speed,
  waitTime,
  gasLimit,
  nativeAsset,
  currency,
  optimismL1SecurityFee,
}: {
  gwei: string;
  speed: GasSpeed;
  waitTime: number;
  gasLimit: string;
  nativeAsset?: ParsedAsset;
  currency: SupportedCurrencyKey;
  optimismL1SecurityFee?: string;
}): GasFeeLegacyParams => {
  const wei = gweiToWei(gwei);
  const gasPrice = parseGasFeeParam({
    wei: new BigNumber(multiply(wei, getBaseFeeMultiplier(speed))).toFixed(0),
  });
  const display = parseGasFeeParam({ wei }).display;

  const estimatedTime = {
    amount: waitTime,
    display: getMinimalTimeUnitStringForMs(Number(multiply(waitTime, 1000))),
  };
  const transactionGasParams = {
    gasPrice: toHex(gasPrice.amount),
  };

  const amount = gasPrice.amount;
  const totalWei = add(multiply(gasLimit, amount), optimismL1SecurityFee || 0);

  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;

  const nativeDisplay = convertAmountAndPriceToNativeDisplayWithThreshold(
    nativeTotalWei,
    nativeAsset?.price?.value || 0,
    currency,
  );

  const gasFee = { amount: totalWei, display: nativeDisplay.display };

  return {
    display,
    estimatedTime,
    gasFee,
    gasPrice,
    option: speed,
    transactionGasParams,
  };
};

export const getBaseFeeMultiplier = (speed: GasSpeed) => {
  switch (speed) {
    case 'urgent':
      return 1.1;
    case 'fast':
      return 1.05;
    case 'normal':
    default:
      return 1;
  }
};

export const getChainWaitTime = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.bsc:
    case ChainId.polygon:
      return { safeWait: 6, proposedWait: 3, fastWait: 3 };
    case ChainId.optimism:
      return { safeWait: 20, proposedWait: 20, fastWait: 20 };
    case ChainId.arbitrum:
      return { safeWait: 8, proposedWait: 8, fastWait: 8 };
    default:
      return { safeWait: 8, proposedWait: 8, fastWait: 8 };
  }
};

export const estimateGas = async ({
  transactionRequest,
  provider,
}: {
  transactionRequest: TransactionRequest;
  provider: Provider;
}) => {
  try {
    const gasLimit = await provider?.estimateGas(transactionRequest);
    return gasLimit?.toString() ?? null;
  } catch (error) {
    return null;
  }
};

export const estimateGasWithPadding = async ({
  transactionRequest,
  contractCallEstimateGas = null,
  callArguments = null,
  provider,
  paddingFactor = 1.1,
}: {
  transactionRequest: TransactionRequest;
  contractCallEstimateGas?: Contract['estimateGas'][string] | null;
  callArguments?: unknown[] | null;
  provider: Provider;
  paddingFactor?: number;
}): Promise<string | null> => {
  try {
    const txPayloadToEstimate: TransactionRequest & { gas?: string } = {
      ...transactionRequest,
    };

    // `getBlock`'s typing requires a parameter, but passing no parameter
    // works as intended and returns the gas limit.
    const { gasLimit } = await (provider.getBlock as () => Promise<Block>)();

    const { to, data } = txPayloadToEstimate;

    // 1 - Check if the receiver is a contract
    const code = to ? await provider.getCode(to) : undefined;
    // 2 - if it's not a contract AND it doesn't have any data use the default gas limit
    if (
      (!contractCallEstimateGas && !to) ||
      (to && !data && (!code || code === '0x'))
    ) {
      return ethUnits.basic_tx.toString();
    }

    // 3 - If it is a contract, call the RPC method `estimateGas` with a safe value
    const saferGasLimit = fraction(gasLimit.toString(), 19, 20);

    txPayloadToEstimate[contractCallEstimateGas ? 'gasLimit' : 'gas'] =
      toHex(saferGasLimit);

    const estimatedGas = await (contractCallEstimateGas
      ? contractCallEstimateGas(...(callArguments ?? []), txPayloadToEstimate)
      : provider.estimateGas(txPayloadToEstimate));

    const lastBlockGasLimit = addBuffer(gasLimit.toString(), 0.9);
    const paddedGas = addBuffer(
      estimatedGas.toString(),
      paddingFactor.toString(),
    );

    // If the safe estimation is above the last block gas limit, use it
    if (greaterThan(estimatedGas.toString(), lastBlockGasLimit)) {
      return estimatedGas.toString();
    }
    // If the estimation is below the last block gas limit, use the padded estimate
    if (greaterThan(lastBlockGasLimit, paddedGas)) {
      return paddedGas;
    }
    // otherwise default to the last block gas limit
    return lastBlockGasLimit;
  } catch (error) {
    return null;
  }
};

export const calculateL1FeeOptimism = async ({
  transactionRequest,
  currentGasPrice,
  provider,
}: {
  currentGasPrice: string;
  transactionRequest: TransactionRequest & { gas?: string };
  provider: Provider;
}): Promise<BigNumberish | undefined> => {
  try {
    if (transactionRequest?.value) {
      transactionRequest.value = toHex(transactionRequest.value.toString());
    }

    if (transactionRequest?.from) {
      const nonce = await provider.getTransactionCount(transactionRequest.from);
      // eslint-disable-next-line require-atomic-updates
      transactionRequest.nonce = Number(nonce);
      delete transactionRequest.from;
    }

    if (transactionRequest.gas) {
      delete transactionRequest.gas;
    }

    if (transactionRequest.to) {
      transactionRequest.to = getAddress(transactionRequest.to);
    }
    if (!transactionRequest.gasLimit) {
      transactionRequest.gasLimit = toHex(
        `${
          transactionRequest.data === '0x'
            ? ethUnits.basic_tx
            : ethUnits.basic_transfer
        }`,
      );
    }

    if (currentGasPrice) transactionRequest.gasPrice = toHex(currentGasPrice);

    const serializedTx = serialize({
      ...transactionRequest,
      nonce: transactionRequest.nonce as number,
    });

    const OVM_GasPriceOracle = new Contract(
      OVM_GAS_PRICE_ORACLE,
      optimismGasOracleAbi,
      provider,
    );
    const l1FeeInWei = await OVM_GasPriceOracle.getL1Fee(serializedTx);
    return l1FeeInWei;
  } catch (e) {
    //
  }
};

export const parseGasFeeParamsBySpeed = ({
  chainId,
  data,
  gasLimit,
  nativeAsset,
  currency,
  optimismL1SecurityFee,
}: {
  chainId: ChainId;
  data: MeteorologyResponse | MeteorologyLegacyResponse;
  gasLimit: string;
  nativeAsset?: ParsedAsset;
  currency: SupportedCurrencyKey;
  optimismL1SecurityFee?: string;
}) => {
  if (chainId === ChainId.mainnet) {
    const response = data as MeteorologyResponse;
    const {
      data: { currentBaseFee, maxPriorityFeeSuggestions, baseFeeSuggestion },
    } = response;

    const blocksToConfirmation = {
      byBaseFee: response.data.blocksToConfirmationByBaseFee,
      byPriorityFee: response.data.blocksToConfirmationByPriorityFee,
    };

    const parseGasFeeParamsSpeed = ({ speed }: { speed: GasSpeed }) =>
      parseGasFeeParams({
        currentBaseFee,
        maxPriorityFeeSuggestions,
        speed,
        wei: baseFeeSuggestion,
        blocksToConfirmation,
        gasLimit,
        nativeAsset,
        currency,
      });

    return {
      custom: parseGasFeeParamsSpeed({
        speed: GasSpeed.CUSTOM,
      }),
      urgent: parseGasFeeParamsSpeed({
        speed: GasSpeed.URGENT,
      }),
      fast: parseGasFeeParamsSpeed({
        speed: GasSpeed.FAST,
      }),
      normal: parseGasFeeParamsSpeed({
        speed: GasSpeed.NORMAL,
      }),
    };
  } else {
    const response = data as MeteorologyLegacyResponse;
    const chainWaitTime = getChainWaitTime(chainId);
    const parseGasFeeParamsSpeed = ({
      speed,
      gwei,
      waitTime,
    }: {
      speed: GasSpeed;
      gwei: string;
      waitTime: number;
    }) =>
      parseGasFeeLegacyParams({
        gwei,
        speed,
        waitTime,
        gasLimit,
        nativeAsset,
        currency,
        optimismL1SecurityFee,
      });

    return {
      custom: parseGasFeeParamsSpeed({
        gwei: response?.data.legacy.fastGasPrice,
        speed: GasSpeed.CUSTOM,
        waitTime: chainWaitTime.fastWait,
      }),
      urgent: parseGasFeeParamsSpeed({
        gwei: response?.data.legacy.fastGasPrice,
        speed: GasSpeed.URGENT,
        waitTime: chainWaitTime.fastWait,
      }),
      fast: parseGasFeeParamsSpeed({
        gwei: response?.data.legacy.proposeGasPrice,
        speed: GasSpeed.FAST,
        waitTime: chainWaitTime.proposedWait,
      }),
      normal: parseGasFeeParamsSpeed({
        gwei: response?.data.legacy.safeGasPrice,
        speed: GasSpeed.NORMAL,
        waitTime: chainWaitTime.safeWait,
      }),
    };
  }
};

export const gasFeeParamsChanged = (
  gasFeeParams1: GasFeeParams | GasFeeLegacyParams,
  gasFeeParams2: GasFeeParams | GasFeeLegacyParams,
) => gasFeeParams1?.gasFee?.amount !== gasFeeParams2?.gasFee?.amount;
