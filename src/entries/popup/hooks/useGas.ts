import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useEffect, useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import { ethUnits } from '~/core/references';
import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';
import { useGasStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import {
  getChainWaitTime,
  parseGasFeeLegacyParams,
  parseGasFeeParams,
} from '~/core/utils/gas';

import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';

export const parseGasFeeParamsBySpeed = ({
  chainId,
  data,
  gasLimit,
  nativeAsset,
}: {
  chainId: Chain['id'];
  data?: MeteorologyResponse | MeteorologyLegacyResponse;
  gasLimit: string;
  nativeAsset?: ParsedAddressAsset;
}) => {
  if (chainId === chain.mainnet.id && data) {
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

export const useGas = ({
  chainId,
  transactionRequest,
}: {
  chainId: Chain['id'];
  transactionRequest: TransactionRequest;
}) => {
  const { data, isLoading } = useGasData({ chainId, transactionRequest });
  const { data: gasLimitData } = useEstimateGasLimit({
    chainId,
    transactionRequest,
  });
  const { selectedGas, setSelectedGas, setGasFeeParamsBySpeed } = useGasStore();
  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>(GasSpeed.NORMAL);
  const nativeAsset = useNativeAssetForNetwork({ chainId });

  const gasLimit = gasLimitData?.gasLimit ?? `${ethUnits.basic_transfer}`;

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed =
    useMemo(
      () =>
        parseGasFeeParamsBySpeed({
          chainId,
          data,
          gasLimit,
          nativeAsset,
        }),
      [chainId, data, gasLimit, nativeAsset],
    );

  useEffect(() => {
    setSelectedGas({
      selectedGas: gasFeeParamsBySpeed[selectedSpeed],
    });
  }, [
    gasFeeParamsBySpeed,
    gasLimit,
    selectedGas.option,
    selectedSpeed,
    setSelectedGas,
  ]);

  useEffect(() => {
    setGasFeeParamsBySpeed({
      gasFeeParamsBySpeed,
    });
  }, [gasFeeParamsBySpeed, setGasFeeParamsBySpeed]);

  return {
    data,
    gasFeeParamsBySpeed,
    setSelectedSpeed,
    selectedSpeed,
    isLoading,
  };
};
