import { TransactionRequest } from '@ethersproject/abstract-provider';
import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { gasUnits } from '~/core/references';
import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
import { useEstimateSwapGasLimit } from '~/core/resources/gas/estimateSwapGasLimit';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';
import { useOptimismL1SecurityFee } from '~/core/resources/gas/optimismL1SecurityFee';
import { useCurrentCurrencyStore, useGasStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParams,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import { gweiToWei, weiToGwei } from '~/core/utils/ethereum';
import {
  FLASHBOTS_MIN_TIP,
  chainNeedsL1SecurityFee,
  gasFeeParamsChanged,
  parseCustomGasFeeParams,
  parseGasFeeParamsBySpeed,
} from '~/core/utils/gas';

import { useDebounce } from './useDebounce';
import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';
import usePrevious from './usePrevious';

const useGas = ({
  chainId,
  defaultSpeed = GasSpeed.NORMAL,
  estimatedGasLimit,
  transactionRequest,
  enabled,
  flashbotsEnabled,
  additionalTime,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  estimatedGasLimit?: string;
  transactionRequest: TransactionRequest | null;
  enabled?: boolean;
  flashbotsEnabled?: boolean;
  additionalTime?: number;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data: gasData, isLoading } = useGasData({ chainId });
  const nativeAsset = useNativeAssetForNetwork({ chainId });
  const prevDefaultSpeed = usePrevious(defaultSpeed);

  const [internalMaxPriorityFee, setInternalMaxPriorityFee] = useState('');
  const [internalMaxBaseFee, setInternalMaxBaseFee] = useState('');

  const debouncedEstimatedGasLimit = useDebounce(estimatedGasLimit, 500);
  const debouncedMaxPriorityFee = useDebounce(internalMaxPriorityFee, 300);
  const prevDebouncedMaxPriorityFee = usePrevious(debouncedMaxPriorityFee);
  const debouncedMaxBaseFee = useDebounce(internalMaxBaseFee, 300);
  const prevDebouncedMaxBaseFee = usePrevious(debouncedMaxBaseFee);

  const { data: optimismL1SecurityFee } = useOptimismL1SecurityFee(
    { transactionRequest: transactionRequest || {}, chainId },
    { enabled: chainNeedsL1SecurityFee(chainId) },
  );

  const {
    selectedGas,
    setSelectedGas,
    gasFeeParamsBySpeed: storeGasFeeParamsBySpeed,
    setGasFeeParamsBySpeed,
    customGasModified,
    setCustomSpeed,
    clearCustomGasModified,
  } = useGasStore();

  const setCustomMaxBaseFee = useCallback((maxBaseFee = '0') => {
    setInternalMaxBaseFee(maxBaseFee);
  }, []);

  const setCustomMaxPriorityFee = useCallback((maxPriorityFee = '0') => {
    setInternalMaxPriorityFee(maxPriorityFee);
  }, []);

  useEffect(() => {
    if (
      !gasData ||
      prevDebouncedMaxBaseFee === debouncedMaxBaseFee ||
      !enabled ||
      chainId !== ChainId.mainnet
    )
      return;

    const { data } = gasData as MeteorologyResponse;
    const currentBaseFee = data.currentBaseFee;
    const secondsPerNewBlock = data.secondsPerNewBlock;

    const blocksToConfirmation = {
      byBaseFee: data.blocksToConfirmationByBaseFee,
      byPriorityFee: data.blocksToConfirmationByPriorityFee,
    };

    const maxPriorityFeePerGas = (
      storeGasFeeParamsBySpeed?.custom as GasFeeParams
    )?.maxPriorityFeePerGas?.amount;

    const newCustomSpeed = parseCustomGasFeeParams({
      currentBaseFee,
      maxPriorityFeeWei: maxPriorityFeePerGas,
      speed: GasSpeed.CUSTOM,
      baseFeeWei: gweiToWei(debouncedMaxBaseFee || '0'),
      blocksToConfirmation,
      gasLimit: estimatedGasLimit || `${gasUnits.basic_transfer}`,
      nativeAsset,
      currency: currentCurrency,
      secondsPerNewBlock,
    });
    setCustomSpeed(newCustomSpeed);
  }, [
    chainId,
    currentCurrency,
    debouncedMaxBaseFee,
    enabled,
    estimatedGasLimit,
    gasData,
    nativeAsset,
    prevDebouncedMaxBaseFee,
    setCustomSpeed,
    storeGasFeeParamsBySpeed?.custom,
  ]);

  useEffect(() => {
    if (
      !gasData ||
      prevDebouncedMaxPriorityFee === debouncedMaxPriorityFee ||
      !enabled ||
      chainId !== ChainId.mainnet
    )
      return;
    const { data } = gasData as MeteorologyResponse;
    const currentBaseFee = data.currentBaseFee;
    const secondsPerNewBlock = data.secondsPerNewBlock;

    const blocksToConfirmation = {
      byBaseFee: data.blocksToConfirmationByBaseFee,
      byPriorityFee: data.blocksToConfirmationByPriorityFee,
    };

    const maxBaseFee = (storeGasFeeParamsBySpeed?.custom as GasFeeParams)
      ?.maxBaseFee?.amount;

    let maxPriorityFeeWei = gweiToWei(debouncedMaxPriorityFee || '0');
    // Set the flashbots minimum
    if (
      flashbotsEnabled &&
      Number(debouncedMaxPriorityFee) < FLASHBOTS_MIN_TIP
    ) {
      maxPriorityFeeWei = gweiToWei(FLASHBOTS_MIN_TIP.toString());
    }

    const newCustomSpeed = parseCustomGasFeeParams({
      currentBaseFee,
      maxPriorityFeeWei,
      speed: GasSpeed.CUSTOM,
      baseFeeWei: maxBaseFee,
      blocksToConfirmation,
      gasLimit: estimatedGasLimit || `${gasUnits.basic_transfer}`,
      nativeAsset,
      currency: currentCurrency,
      secondsPerNewBlock,
    });
    setCustomSpeed(newCustomSpeed);
  }, [
    chainId,
    currentCurrency,
    debouncedMaxPriorityFee,
    enabled,
    estimatedGasLimit,
    flashbotsEnabled,
    gasData,
    internalMaxPriorityFee,
    nativeAsset,
    prevDebouncedMaxPriorityFee,
    setCustomSpeed,
    storeGasFeeParamsBySpeed?.custom,
  ]);

  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>(defaultSpeed);

  const gasFeeParamsBySpeed:
    | GasFeeParamsBySpeed
    | GasFeeLegacyParamsBySpeed
    | null = useMemo(() => {
    const newGasFeeParamsBySpeed =
      !isLoading &&
      ((gasData as MeteorologyResponse)?.data?.currentBaseFee ||
        (gasData as MeteorologyLegacyResponse)?.data?.legacy)
        ? parseGasFeeParamsBySpeed({
            chainId,
            data: gasData as MeteorologyLegacyResponse | MeteorologyResponse,
            gasLimit:
              debouncedEstimatedGasLimit || `${gasUnits.basic_transfer}`,
            nativeAsset,
            currency: currentCurrency,
            optimismL1SecurityFee,
            flashbotsEnabled,
            additionalTime,
          })
        : null;

    if (customGasModified && newGasFeeParamsBySpeed) {
      newGasFeeParamsBySpeed.custom = storeGasFeeParamsBySpeed.custom;
    }
    return newGasFeeParamsBySpeed;
  }, [
    additionalTime,
    isLoading,
    chainId,
    flashbotsEnabled,
    gasData,
    debouncedEstimatedGasLimit,
    nativeAsset,
    currentCurrency,
    optimismL1SecurityFee,
    customGasModified,
    storeGasFeeParamsBySpeed.custom,
  ]);

  useEffect(() => {
    if (prevDefaultSpeed !== defaultSpeed) {
      setSelectedSpeed(defaultSpeed);
    }
  }, [defaultSpeed, prevDefaultSpeed]);

  useEffect(() => {
    if (
      enabled &&
      gasFeeParamsBySpeed?.[selectedSpeed] &&
      gasFeeParamsChanged(selectedGas, gasFeeParamsBySpeed?.[selectedSpeed])
    ) {
      setSelectedGas({
        selectedGas: gasFeeParamsBySpeed[selectedSpeed],
      });
    }
  }, [
    enabled,
    gasFeeParamsBySpeed,
    selectedGas,
    selectedSpeed,
    setSelectedGas,
  ]);

  useEffect(() => {
    if (
      enabled &&
      gasFeeParamsBySpeed?.[selectedSpeed] &&
      gasFeeParamsChanged(
        storeGasFeeParamsBySpeed[selectedSpeed],
        gasFeeParamsBySpeed[selectedSpeed],
      )
    ) {
      setGasFeeParamsBySpeed({
        gasFeeParamsBySpeed,
      });
    }
  }, [
    enabled,
    gasFeeParamsBySpeed,
    selectedSpeed,
    setGasFeeParamsBySpeed,
    storeGasFeeParamsBySpeed,
  ]);

  return {
    gasFeeParamsBySpeed,
    setSelectedSpeed,
    selectedSpeed,
    isLoading,
    setCustomMaxBaseFee,
    setCustomMaxPriorityFee,
    clearCustomGasModified,
    currentBaseFee: weiToGwei(
      (gasData as MeteorologyResponse)?.data?.currentBaseFee,
    ),
    baseFeeTrend: (gasData as MeteorologyResponse)?.data?.baseFeeTrend,
  };
};

export const useTransactionGas = ({
  chainId,
  defaultSpeed,
  transactionRequest,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
}) => {
  const { data: estimatedGasLimit } = useEstimateGasLimit({
    chainId,
    transactionRequest,
  });

  return useGas({
    chainId,
    defaultSpeed,
    estimatedGasLimit,
    transactionRequest,
    enabled: true,
  });
};

export const useSwapGas = ({
  chainId,
  defaultSpeed,
  quote,
  assetToSell,
  assetToBuy,
  enabled,
  flashbotsEnabled,
  quoteServiceTime,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  quote?: Quote | CrosschainQuote | QuoteError;
  assetToSell?: ParsedSearchAsset;
  assetToBuy?: ParsedSearchAsset;
  enabled?: boolean;
  flashbotsEnabled?: boolean;
  quoteServiceTime?: number;
}) => {
  const { data: estimatedGasLimit } = useEstimateSwapGasLimit({
    chainId,
    quote,
    assetToSell,
    assetToBuy,
  });

  const transactionRequest: TransactionRequest | null = useMemo(() => {
    if (quote && !(quote as QuoteError).error) {
      const q = quote as Quote | CrosschainQuote;
      const { to, from, value, data } = q;
      return {
        to,
        from,
        value,
        chainId,
        data,
      };
    } else {
      return null;
    }
  }, [chainId, quote]);

  return useGas({
    chainId,
    defaultSpeed,
    estimatedGasLimit,
    transactionRequest,
    enabled,
    flashbotsEnabled,
    additionalTime: quoteServiceTime,
  });
};
