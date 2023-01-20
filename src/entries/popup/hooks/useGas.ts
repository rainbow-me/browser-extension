import { TransactionRequest } from '@ethersproject/abstract-provider';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ethUnits } from '~/core/references';
import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';
import { useOptimismL1SecurityFee } from '~/core/resources/gas/optimismL1SecurityFee';
import { useCurrentCurrencyStore, useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
  TransactionGasParams,
} from '~/core/types/gas';
import { gweiToWei, weiToGwei } from '~/core/utils/ethereum';
import {
  gasFeeParamsChanged,
  parseCustomGasFeeParams,
  parseGasFeeParamsBySpeed,
} from '~/core/utils/gas';

import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';

export const useGas = ({
  chainId,
  defaultSpeed,
  transactionRequest,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
}) => {
  const { data: gasData, isLoading } = useGasData({ chainId });
  const { data: estimatedGasLimit } = useEstimateGasLimit({
    chainId,
    transactionRequest,
  });

  const { data: optimismL1SecurityFee } = useOptimismL1SecurityFee(
    { transactionRequest },
    { enabled: chainId === ChainId.optimism },
  );

  const { currentCurrency } = useCurrentCurrencyStore();
  const nativeAsset = useNativeAssetForNetwork({ chainId });

  const {
    selectedGas,
    setSelectedGas,
    gasFeeParamsBySpeed: storeGasFeeParamsBySpeed,
    setGasFeeParamsBySpeed,
    customGasModified,
    setCustomSpeed,
    clearCustomGasModified,
  } = useGasStore();

  const setCustomMaxBaseFee = useCallback(
    (maxBaseFee = '0') => {
      if (!gasData) return;
      const { data } = gasData as MeteorologyResponse;
      const currentBaseFee = data.currentBaseFee;

      const blocksToConfirmation = {
        byBaseFee: data.blocksToConfirmationByBaseFee,
        byPriorityFee: data.blocksToConfirmationByPriorityFee,
      };

      const maxPriorityFeePerGas = new BigNumber(
        (
          storeGasFeeParamsBySpeed?.custom
            .transactionGasParams as TransactionGasParams
        ).maxPriorityFeePerGas,
      ).toString();

      const newCustomSpeed = parseCustomGasFeeParams({
        currentBaseFee,
        maxPriorityFeeWei: maxPriorityFeePerGas,
        speed: GasSpeed.CUSTOM,
        baseFeeWei: gweiToWei(maxBaseFee),
        blocksToConfirmation,
        gasLimit: estimatedGasLimit || `${ethUnits.basic_transfer}`,
        nativeAsset,
        currency: currentCurrency,
      });
      setCustomSpeed(newCustomSpeed);
    },
    [
      storeGasFeeParamsBySpeed?.custom,
      gasData,
      estimatedGasLimit,
      nativeAsset,
      currentCurrency,
      setCustomSpeed,
    ],
  );

  const setCustomMinerTip = useCallback(
    (minerTip = '0') => {
      if (!gasData) return;
      const { data } = gasData as MeteorologyResponse;
      const currentBaseFee = data.currentBaseFee;

      const blocksToConfirmation = {
        byBaseFee: data.blocksToConfirmationByBaseFee,
        byPriorityFee: data.blocksToConfirmationByPriorityFee,
      };

      const maxBaseFee = new BigNumber(
        (
          storeGasFeeParamsBySpeed?.custom
            .transactionGasParams as TransactionGasParams
        ).maxFeePerGas,
      ).toString();

      const newCustomSpeed = parseCustomGasFeeParams({
        currentBaseFee,
        maxPriorityFeeWei: gweiToWei(minerTip),
        speed: GasSpeed.CUSTOM,
        baseFeeWei: maxBaseFee,
        blocksToConfirmation,
        gasLimit: estimatedGasLimit || `${ethUnits.basic_transfer}`,
        nativeAsset,
        currency: currentCurrency,
      });
      setCustomSpeed(newCustomSpeed);
    },
    [
      currentCurrency,
      estimatedGasLimit,
      gasData,
      nativeAsset,
      setCustomSpeed,
      storeGasFeeParamsBySpeed?.custom,
    ],
  );

  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>(
    defaultSpeed || GasSpeed.NORMAL,
  );

  const gasFeeParamsBySpeed:
    | GasFeeParamsBySpeed
    | GasFeeLegacyParamsBySpeed
    | null = useMemo(() => {
    const newGasFeeParamsBySpeed = !isLoading
      ? parseGasFeeParamsBySpeed({
          chainId,
          data: gasData as MeteorologyLegacyResponse | MeteorologyResponse,
          gasLimit: estimatedGasLimit || `${ethUnits.basic_transfer}`,
          nativeAsset,
          currency: currentCurrency,
          optimismL1SecurityFee,
        })
      : null;

    if (customGasModified && newGasFeeParamsBySpeed) {
      newGasFeeParamsBySpeed.custom = storeGasFeeParamsBySpeed.custom;
    }
    return newGasFeeParamsBySpeed;
  }, [
    isLoading,
    chainId,
    gasData,
    estimatedGasLimit,
    nativeAsset,
    currentCurrency,
    optimismL1SecurityFee,
    customGasModified,
    storeGasFeeParamsBySpeed.custom,
  ]);

  useEffect(() => {
    if (
      gasFeeParamsBySpeed?.[selectedSpeed] &&
      gasFeeParamsChanged(selectedGas, gasFeeParamsBySpeed?.[selectedSpeed])
    ) {
      setSelectedGas({
        selectedGas: gasFeeParamsBySpeed[selectedSpeed],
      });
    }
  }, [gasFeeParamsBySpeed, selectedGas, selectedSpeed, setSelectedGas]);

  useEffect(() => {
    if (
      gasFeeParamsBySpeed?.[selectedSpeed] &&
      gasFeeParamsChanged(
        gasFeeParamsBySpeed[selectedSpeed],
        storeGasFeeParamsBySpeed[selectedSpeed],
      )
    ) {
      setGasFeeParamsBySpeed({
        gasFeeParamsBySpeed,
      });
    }
  }, [
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
    setCustomMinerTip,
    clearCustomGasModified,
    currentBaseFee: weiToGwei(
      (gasData as MeteorologyResponse)?.data?.currentBaseFee,
    ),
    baseFeeTrend: (gasData as MeteorologyResponse)?.data?.baseFeeTrend,
  };
};
