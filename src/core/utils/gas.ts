import {
  Block,
  Provider,
  TransactionRequest,
} from '@ethersproject/abstract-provider';
import { Contract } from '@ethersproject/contracts';
import BigNumber from 'bignumber.js';
import { Chain, chain } from 'wagmi';

import {
  SupportedCurrencyKey,
  ethUnits,
  supportedCurrencies,
} from '../references';
import { ParsedAddressAsset } from '../types/assets';
import { bsc } from '../types/chains';
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
  convertRawAmountToBalance,
  convertStringToHex,
  divide,
  fraction,
  greaterThan,
  handleSignificantDecimals,
  lessThan,
  multiply,
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
  const gwei = weiToGwei(wei);
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
  nativeAsset?: ParsedAddressAsset;
  blocksToConfirmation: BlocksToConfirmation;
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

  const amount = add(maxBaseFee.amount, maxPriorityFeePerGas.amount);
  const totalWei = multiply(gasLimit, amount);
  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;
  const gasFeeDisplay = handleSignificantDecimals(nativeTotalWei, 4);
  const gasFee = { amount: totalWei, display: gasFeeDisplay };

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
}: {
  gwei: string;
  speed: GasSpeed;
  waitTime: number;
  gasLimit: string;
  nativeAsset?: ParsedAddressAsset;
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
    gasPrice: addHexPrefix(convertStringToHex(gasPrice.amount)),
  };

  const amount = gasPrice.amount;
  const totalWei = multiply(gasLimit, amount);
  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;
  const gasFeeDisplay = handleSignificantDecimals(nativeTotalWei, 4);
  const gasFee = { amount: totalWei, display: gasFeeDisplay };

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

export const getChainWaitTime = (chainId: Chain['id']) => {
  switch (chainId) {
    case bsc.id:
    case chain.polygon.id:
      return { safeWait: 6, proposedWait: 3, fastWait: 3 };
    case chain.optimism.id:
      return { safeWait: 20, proposedWait: 20, fastWait: 20 };
    case chain.arbitrum.id:
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
      addHexPrefix(convertStringToHex(saferGasLimit));

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
