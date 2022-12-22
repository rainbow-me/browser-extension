import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useEffect, useMemo, useState } from 'react';
import { Chain } from 'wagmi';

import { ethUnits } from '~/core/references';
import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
import { useOptimismL1SecurityFee } from '~/core/resources/gas/optimismL1SecurityFee';
import { useCurrentCurrencyStore, useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import {
  gasFeeParamsChanged,
  parseGasFeeParamsBySpeed,
} from '~/core/utils/gas';

import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';

export const useGas = ({
  chainId,
  defaultSpeed,
  transactionRequest,
}: {
  chainId: Chain['id'];
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
}) => {
  const { data, isLoading } = useGasData({ chainId, transactionRequest });
  const { data: estimatedGasLimit } = useEstimateGasLimit({
    chainId,
    transactionRequest,
  });
  const { data: optimismL1SecurityFee } = useOptimismL1SecurityFee(
    { transactionRequest },
    { enabled: chainId === ChainId.optimism },
  );
  const { currentCurrency } = useCurrentCurrencyStore();
  const {
    selectedGas,
    setSelectedGas,
    gasFeeParamsBySpeed: storeGasFeeParamsBySpeed,
    setGasFeeParamsBySpeed,
  } = useGasStore();
  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>(
    defaultSpeed || GasSpeed.NORMAL,
  );
  const nativeAsset = useNativeAssetForNetwork({ chainId });

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed =
    useMemo(() => {
      return parseGasFeeParamsBySpeed({
        chainId,
        data,
        gasLimit: estimatedGasLimit || `${ethUnits.basic_transfer}`,
        nativeAsset,
        currency: currentCurrency,
        optimismL1SecurityFee,
      });
    }, [
      chainId,
      data,
      estimatedGasLimit,
      nativeAsset,
      currentCurrency,
      optimismL1SecurityFee,
    ]);

  useEffect(() => {
    if (gasFeeParamsChanged(selectedGas, gasFeeParamsBySpeed[selectedSpeed])) {
      setSelectedGas({
        selectedGas: gasFeeParamsBySpeed[selectedSpeed],
      });
    }
  }, [gasFeeParamsBySpeed, selectedGas, selectedSpeed, setSelectedGas]);

  useEffect(() => {
    if (
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
    data,
    gasFeeParamsBySpeed,
    setSelectedSpeed,
    selectedSpeed,
    isLoading,
  };
};
