import {
  Abi,
  Address,
  Hex,
  PublicClient,
  formatGwei,
  getAddress,
  numberToHex,
  parseGwei,
  serializeTransaction,
} from 'viem';

import { useNetworkStore } from '~/core/state/networks/networks';
import { globalColors } from '~/design-system/styles/designTokens';
import { RainbowError, logger } from '~/logger';

import { i18n } from '../languages';
import {
  OVM_GAS_PRICE_ORACLE,
  SupportedCurrencyKey,
  supportedCurrencies,
} from '../references';
import {
  MeteorologyData,
  isMeteorologyEIP1559,
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
import { TransactionRequest } from '../types/transactions';

import { formatNumber } from './formatNumber';
import { fetchJsonLocally } from './localJson';
import {
  convertAmountAndPriceToNativeDisplayWithThreshold,
  convertRawAmountToBalance,
} from './numbers';
import { getMinimalTimeUnitStringForMs } from './time';

const formatDisplayNumber = (number: number | string) => {
  const n = Number(number);
  if (n === 0) {
    return '0';
  } else if (n < 1) {
    return n.toFixed(3);
  } else if (n < 2) {
    return n.toFixed(2);
  } else {
    return n.toFixed(0);
  }
};

const parseGasDataConfirmationTime = ({
  maxBaseFee,
  maxPriorityFee,
  blocksToConfirmation,
  additionalTime = 0,
  secondsPerNewBlock,
}: {
  maxBaseFee: bigint;
  maxPriorityFee: bigint;
  blocksToConfirmation: BlocksToConfirmation;
  additionalTime?: number;
  secondsPerNewBlock: number;
}) => {
  let blocksToWaitForPriorityFee = 0;
  let blocksToWaitForBaseFee = 0;
  const { byPriorityFee, byBaseFee } = blocksToConfirmation;

  if (maxPriorityFee < BigInt(byPriorityFee[4]) / 2n) {
    blocksToWaitForPriorityFee += 240;
  } else if (maxPriorityFee < BigInt(byPriorityFee[4])) {
    blocksToWaitForPriorityFee += 4;
  } else if (maxPriorityFee < BigInt(byPriorityFee[3])) {
    blocksToWaitForPriorityFee += 3;
  } else if (maxPriorityFee < BigInt(byPriorityFee[2])) {
    blocksToWaitForPriorityFee += 2;
  } else if (maxPriorityFee < BigInt(byPriorityFee[1])) {
    blocksToWaitForPriorityFee += 1;
  }

  if (BigInt(byBaseFee[4]) < maxBaseFee) {
    blocksToWaitForBaseFee += 1;
  } else if (BigInt(byBaseFee[8]) < maxBaseFee) {
    blocksToWaitForBaseFee += 4;
  } else if (BigInt(byBaseFee[40]) < maxBaseFee) {
    blocksToWaitForBaseFee += 8;
  } else if (BigInt(byBaseFee[120]) < maxBaseFee) {
    blocksToWaitForBaseFee += 40;
  } else if (BigInt(byBaseFee[240]) < maxBaseFee) {
    blocksToWaitForBaseFee += 120;
  } else {
    blocksToWaitForBaseFee += 240;
  }

  const totalBlocksToWait =
    blocksToWaitForBaseFee +
    (blocksToWaitForBaseFee < 240 ? blocksToWaitForPriorityFee : 0);
  const timeAmount = secondsPerNewBlock * totalBlocksToWait + additionalTime;
  return {
    amount: timeAmount,
    display: `${timeAmount >= 3600 ? '>' : '~'} ${getMinimalTimeUnitStringForMs(
      timeAmount * 1000,
    )}`,
  };
};

const parseGasFeeParam = ({ wei }: { wei: bigint }): GasFeeParam => {
  const gwei = formatGwei(wei);
  return {
    amount: wei,
    display: `${formatNumber(gwei)} Gwei`,
    gwei,
  };
};

export const parseCustomGasFeeParams = ({
  baseFeeWei,
  currentBaseFee,
  speed,
  maxPriorityFeeWei,
  blocksToConfirmation,
  gasLimit,
  nativeAsset,
  currency,
  additionalTime,
  secondsPerNewBlock,
}: {
  baseFeeWei: bigint;
  speed: GasSpeed;
  maxPriorityFeeWei: bigint;
  currentBaseFee: string;
  gasLimit: bigint;
  nativeAsset?: ParsedAsset;
  blocksToConfirmation: BlocksToConfirmation;
  currency: SupportedCurrencyKey;
  additionalTime?: number;
  secondsPerNewBlock: number;
}): GasFeeParams => {
  const maxBaseFee = parseGasFeeParam({ wei: baseFeeWei });
  const maxPriorityFeePerGas = parseGasFeeParam({ wei: maxPriorityFeeWei });

  const currentBaseFeeBi = BigInt(currentBaseFee);
  const baseFee =
    currentBaseFeeBi < maxBaseFee.amount ? currentBaseFeeBi : maxBaseFee.amount;

  const display = `${formatDisplayNumber(
    Number(formatGwei(baseFee + maxPriorityFeePerGas.amount)),
  )} - ${formatDisplayNumber(
    Number(formatGwei(baseFeeWei + maxPriorityFeePerGas.amount)),
  )} Gwei`;

  const estimatedTime = parseGasDataConfirmationTime({
    maxBaseFee: maxBaseFee.amount,
    maxPriorityFee: maxPriorityFeePerGas.amount,
    blocksToConfirmation,
    additionalTime,
    secondsPerNewBlock,
  });

  const maxFeePerGasWei = maxPriorityFeePerGas.amount + maxBaseFee.amount;
  const transactionGasParams = {
    maxPriorityFeePerGas: maxPriorityFeePerGas.amount,
    maxFeePerGas: maxFeePerGasWei,
  };

  const totalWei = gasLimit * maxFeePerGasWei;
  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;
  const nativeDisplay = convertAmountAndPriceToNativeDisplayWithThreshold(
    nativeTotalWei || 0,
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

export const parseCustomGasFeeLegacyParams = ({
  speed,
  gasPriceWei,
  gasLimit,
  nativeAsset,
  currency,
  waitTime,
}: {
  speed: GasSpeed;
  gasPriceWei: bigint;
  gasLimit: bigint;
  nativeAsset?: ParsedAsset;
  currency: SupportedCurrencyKey;
  waitTime: number | null;
}): GasFeeLegacyParams => {
  const gasPrice = parseGasFeeParam({ wei: gasPriceWei });
  const display = `${formatDisplayNumber(gasPrice.gwei)} Gwei`;

  const estimatedTime = {
    amount: waitTime || 0,
    display: waitTime
      ? `${waitTime >= 3600 ? '>' : '~'} ${getMinimalTimeUnitStringForMs(
          waitTime * 1000,
        )}`
      : '',
  };
  const transactionGasParams = { gasPrice: gasPrice.amount };

  const totalWei = gasLimit * gasPrice.amount;

  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;

  const nativeDisplay = nativeAsset?.price?.value
    ? convertAmountAndPriceToNativeDisplayWithThreshold(
        nativeTotalWei,
        nativeAsset?.price?.value,
        currency,
      )
    : convertRawAmountToBalance(totalWei, {
        decimals: nativeAsset?.decimals || 18,
        symbol: nativeAsset?.symbol,
      });

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

const parseGasFeeParams = ({
  wei,
  currentBaseFee,
  speed,
  maxPriorityFeeSuggestions,
  blocksToConfirmation,
  gasLimit,
  nativeAsset,
  currency,
  additionalTime,
  secondsPerNewBlock,
  optimismL1SecurityFee,
}: {
  wei: string;
  speed: GasSpeed;
  maxPriorityFeeSuggestions: {
    fast: string;
    urgent: string;
    normal: string;
  };
  currentBaseFee: string;
  gasLimit: bigint;
  nativeAsset?: ParsedAsset;
  blocksToConfirmation: BlocksToConfirmation;
  currency: SupportedCurrencyKey;
  additionalTime?: number;
  secondsPerNewBlock: number;
  optimismL1SecurityFee?: string | null;
}): GasFeeParams => {
  const maxBaseFee = parseGasFeeParam({
    wei: applyFactor(BigInt(wei), getBaseFeeMultiplier(speed)),
  });
  const maxPriorityFeePerGas = parseGasFeeParam({
    wei: BigInt(
      maxPriorityFeeSuggestions[speed === 'custom' ? 'urgent' : speed],
    ),
  });

  const currentBaseFeeBi = BigInt(currentBaseFee);
  const baseFee =
    currentBaseFeeBi < maxBaseFee.amount ? currentBaseFeeBi : maxBaseFee.amount;

  const display = `${formatDisplayNumber(
    Number(formatGwei(baseFee + maxPriorityFeePerGas.amount)),
  )} - ${formatDisplayNumber(
    Number(formatGwei(maxBaseFee.amount + maxPriorityFeePerGas.amount)),
  )} Gwei`;

  const estimatedTime = parseGasDataConfirmationTime({
    maxBaseFee: maxBaseFee.amount,
    maxPriorityFee: maxPriorityFeePerGas.amount,
    blocksToConfirmation,
    additionalTime,
    secondsPerNewBlock,
  });

  const maxFeePerGasWei = maxPriorityFeePerGas.amount + maxBaseFee.amount;
  const transactionGasParams = {
    maxPriorityFeePerGas: maxPriorityFeePerGas.amount,
    maxFeePerGas: maxFeePerGasWei,
  };

  const totalWei =
    gasLimit * maxFeePerGasWei + BigInt(optimismL1SecurityFee || '0');
  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;
  const nativeDisplay = nativeAsset?.price?.value
    ? convertAmountAndPriceToNativeDisplayWithThreshold(
        nativeTotalWei,
        nativeAsset?.price?.value,
        currency,
      )
    : convertRawAmountToBalance(totalWei, {
        decimals: nativeAsset?.decimals || 18,
        symbol: nativeAsset?.symbol,
      });
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

const parseGasFeeLegacyParams = ({
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
  waitTime: number | null;
  gasLimit: bigint;
  nativeAsset?: ParsedAsset;
  currency: SupportedCurrencyKey;
  optimismL1SecurityFee?: string | null;
}): GasFeeLegacyParams => {
  const wei = parseGwei(gwei);
  const gasPrice = parseGasFeeParam({
    wei: applyFactor(wei, getBaseFeeMultiplier(speed)),
  });
  const display = `${formatDisplayNumber(gasPrice.gwei)} Gwei`;

  const estimatedTime = {
    amount: waitTime || 0,
    display: waitTime
      ? `${waitTime >= 3600 ? '>' : '~'} ${getMinimalTimeUnitStringForMs(
          waitTime * 1000,
        )}`
      : '',
  };
  const transactionGasParams = { gasPrice: gasPrice.amount };

  const totalWei =
    gasLimit * gasPrice.amount + BigInt(optimismL1SecurityFee || '0');

  const nativeTotalWei = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[nativeAsset?.symbol as SupportedCurrencyKey],
  ).amount;

  const nativeDisplay = nativeAsset?.price?.value
    ? convertAmountAndPriceToNativeDisplayWithThreshold(
        nativeTotalWei,
        nativeAsset?.price?.value,
        currency,
      )
    : convertRawAmountToBalance(totalWei, {
        decimals: nativeAsset?.decimals || 18,
        symbol: nativeAsset?.symbol,
      });

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

const getBaseFeeMultiplier = (speed: GasSpeed) => {
  switch (speed) {
    case 'urgent':
    case 'custom':
      return 1.2;
    case 'fast':
      return 1.15;
    case 'normal':
    default:
      return 1.1;
  }
};

const getChainWaitTime = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.bsc:
    case ChainId.polygon:
    case ChainId.avalanche:
      return { safeWait: 6, proposedWait: 3, fastWait: 3 };
    case ChainId.optimism:
    case ChainId.ink:
      return { safeWait: 20, proposedWait: 20, fastWait: 20 };
    case ChainId.base:
      return { safeWait: 20, proposedWait: 20, fastWait: 20 };
    case ChainId.zora:
      return { safeWait: 20, proposedWait: 20, fastWait: 20 };
    case ChainId.arbitrum:
      return { safeWait: 8, proposedWait: 8, fastWait: 8 };
    default:
      return null;
  }
};

export const estimateGas = async ({
  transactionRequest,
  client,
}: {
  transactionRequest: TransactionRequest;
  client: PublicClient;
}) => {
  try {
    const gasLimit = await client.estimateGas({
      account: transactionRequest.from as Address,
      to: transactionRequest.to as Address,
      value: transactionRequest.value,
      data: transactionRequest.data as Hex | undefined,
    });
    return gasLimit ?? null;
  } catch (error) {
    return null;
  }
};

const applyFactor = (value: bigint, factor: number): bigint =>
  (value * BigInt(Math.round(factor * 1000))) / 1000n;

export const estimateGasWithPadding = async ({
  transactionRequest,
  contractCallEstimateGas,
  client,
  paddingFactor = 1.1,
}: {
  transactionRequest: TransactionRequest;
  contractCallEstimateGas?: (() => Promise<bigint>) | null;
  client: PublicClient;
  paddingFactor?: number;
}): Promise<bigint | null> => {
  try {
    const block = await client.getBlock();
    const blockGasLimit = block.gasLimit;

    const { to, data } = transactionRequest;

    const code = to
      ? await client.getCode({ address: to as Address })
      : undefined;
    if (
      (!contractCallEstimateGas && !to && !data) ||
      (to && !data && (!code || code === '0x'))
    ) {
      const chainGasUnits = useNetworkStore
        .getState()
        .getChainGasUnits(transactionRequest.chainId);
      return BigInt(chainGasUnits.basic.eoaTransfer);
    }

    const estimatedGas = await (contractCallEstimateGas
      ? contractCallEstimateGas()
      : client.estimateGas({
          account: transactionRequest.from as Address,
          to: transactionRequest.to as Address,
          value: transactionRequest.value,
          data: transactionRequest.data,
        }));

    const lastBlockGasLimit = applyFactor(blockGasLimit, 0.9);
    const paddedGas = applyFactor(estimatedGas, paddingFactor);

    if (estimatedGas > lastBlockGasLimit) {
      return estimatedGas;
    }
    if (lastBlockGasLimit > paddedGas) {
      return paddedGas;
    }
    return lastBlockGasLimit;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'UNPREDICTABLE_GAS_LIMIT'
    ) {
      return null;
    }

    logger.error(new RainbowError(`estimateGasWithPadding error: ${error}`));
    return null;
  }
};

export const calculateL1FeeOptimism = async ({
  transactionRequest: txRequest,
  currentGasPrice,
  client,
}: {
  currentGasPrice: string;
  transactionRequest: TransactionRequest;
  client: PublicClient;
}): Promise<Hex | undefined> => {
  const transactionRequest = { ...txRequest };
  try {
    if (transactionRequest?.from) {
      const nonce = await client.getTransactionCount({
        address: transactionRequest.from as Address,
      });
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
      const chainGasUnits = useNetworkStore
        .getState()
        .getChainGasUnits(txRequest.chainId);
      transactionRequest.gasLimit = BigInt(
        transactionRequest.data === '0x'
          ? chainGasUnits.basic.eoaTransfer
          : chainGasUnits.basic.tokenTransfer,
      );
    }

    if (currentGasPrice) transactionRequest.gasPrice = BigInt(currentGasPrice);

    const serializedTx = serializeTransaction({
      to: transactionRequest.to,
      nonce: transactionRequest.nonce as number,
      data: transactionRequest.data,
      value: transactionRequest.value,
      gas: transactionRequest.gasLimit,
      gasPrice: transactionRequest.gasPrice,
      chainId: transactionRequest.chainId,
    });

    const optimismGasOracleAbi = (await fetchJsonLocally(
      'abis/optimism-gas-oracle-abi.json',
    )) as Abi;

    const l1FeeInWei = await client.readContract({
      address: OVM_GAS_PRICE_ORACLE as Address,
      abi: optimismGasOracleAbi,
      functionName: 'getL1Fee',
      args: [serializedTx],
    });
    return numberToHex(l1FeeInWei as bigint);
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
  additionalTime = 0,
}: {
  chainId: ChainId;
  data: MeteorologyData;
  gasLimit: bigint;
  nativeAsset?: ParsedAsset;
  currency: SupportedCurrencyKey;
  optimismL1SecurityFee?: string | null;
  additionalTime?: number;
}) => {
  if (isMeteorologyEIP1559(data)) {
    const {
      data: {
        currentBaseFee,
        maxPriorityFeeSuggestions,
        baseFeeSuggestion,
        secondsPerNewBlock,
      },
    } = data;

    const blocksToConfirmation = {
      byBaseFee: data.data.blocksToConfirmationByBaseFee,
      byPriorityFee: data.data.blocksToConfirmationByPriorityFee,
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
        additionalTime,
        secondsPerNewBlock,
        optimismL1SecurityFee,
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
    const chainWaitTime = getChainWaitTime(chainId);
    const parseGasFeeParamsSpeed = ({
      speed,
      gwei,
      waitTime,
    }: {
      speed: GasSpeed;
      gwei: string;
      waitTime: number | null;
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
        gwei: data.data.legacy.fastGasPrice,
        speed: GasSpeed.CUSTOM,
        waitTime: chainWaitTime
          ? chainWaitTime.fastWait + additionalTime
          : null,
      }),
      urgent: parseGasFeeParamsSpeed({
        gwei: data.data.legacy.fastGasPrice,
        speed: GasSpeed.URGENT,
        waitTime: chainWaitTime
          ? chainWaitTime.fastWait + additionalTime
          : null,
      }),
      fast: parseGasFeeParamsSpeed({
        gwei: data.data.legacy.proposeGasPrice,
        speed: GasSpeed.FAST,
        waitTime: chainWaitTime
          ? chainWaitTime.proposedWait + additionalTime
          : null,
      }),
      normal: parseGasFeeParamsSpeed({
        gwei: data.data.legacy.safeGasPrice,
        speed: GasSpeed.NORMAL,
        waitTime: chainWaitTime
          ? chainWaitTime.safeWait + additionalTime
          : null,
      }),
    };
  }
};

export const gasFeeParamsChanged = (
  gasFeeParams1: GasFeeParams | GasFeeLegacyParams | null | undefined,
  gasFeeParams2: GasFeeParams | GasFeeLegacyParams | null | undefined,
) => gasFeeParams1?.gasFee?.amount !== gasFeeParams2?.gasFee?.amount;

export const getBaseFeeTrendParams = (trend: number) => {
  switch (trend) {
    case -1:
      return {
        color: 'green',
        borderColor: globalColors.greenA10,
        label: i18n.t('custom_gas.base_trend.falling'),
        symbol: 'arrow.down.forward',
        explainer: i18n.t('explainers.custom_gas.current_base_falling'),
        emoji: '📉',
      };
    case 0:
      return {
        color: 'yellow',
        borderColor: globalColors.yellowA10,
        label: i18n.t('custom_gas.base_trend.stable'),
        symbol: 'sun.max.fill',
        explainer: i18n.t('explainers.custom_gas.current_base_stable'),
        emoji: '🌞',
      };
    case 1:
      return {
        color: 'red',
        borderColor: globalColors.redA10,
        label: i18n.t('custom_gas.base_trend.surging'),
        symbol: 'exclamationmark.triangle.fill',
        explainer: i18n.t('explainers.custom_gas.current_base_surging'),
        emoji: '🎢',
      };
    case 2:
      return {
        color: 'orange',
        borderColor: globalColors.orangeA10,
        label: i18n.t('custom_gas.base_trend.rising'),
        symbol: 'arrow.up.forward',
        explainer: i18n.t('explainers.custom_gas.current_base_rising'),
        emoji: '🥵',
      };
    default:
      return {
        color: 'blue',
        borderColor: '',
        label: '',
        symbol: '',
        explainer: '',
        emoji: '⛽',
      };
  }
};
