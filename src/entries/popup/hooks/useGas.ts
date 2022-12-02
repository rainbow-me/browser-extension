import { useEffect, useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import { useGasData } from '~/core/resources/gas';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';
import { useGasStore } from '~/core/state';
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
import { add } from '~/core/utils/numbers';

export const useGas = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data, isLoading } = useGasData({ chainId });
  const { selectedGas, setSelectedGas } = useGasStore();
  const [selectedSpeed, setSelectedSpeed] = useState(GasSpeed.NORMAL);

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed =
    useMemo(() => {
      if (chainId === chain.mainnet.id && data) {
        const response = data as MeteorologyResponse;
        const {
          data: {
            currentBaseFee,
            maxPriorityFeeSuggestions,
            baseFeeSuggestion,
          },
        } = response;

        const blocksToConfirmation = {
          byBaseFee: response.data.blocksToConfirmationByBaseFee,
          byPriorityFee: response.data.blocksToConfirmationByPriorityFee,
        };
        return {
          custom: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: GasSpeed.CUSTOM,
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
          urgent: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: GasSpeed.URGENT,
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
          fast: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: GasSpeed.FAST,
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
          normal: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: GasSpeed.NORMAL,
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
        };
      } else {
        const response = data as MeteorologyLegacyResponse;
        const chainWaitTime = getChainWaitTime(chainId);
        return {
          custom: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.fastGasPrice,
            speed: GasSpeed.CUSTOM,
            waitTime: chainWaitTime.fastWait,
          }),
          urgent: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.fastGasPrice,
            speed: GasSpeed.URGENT,
            waitTime: chainWaitTime.fastWait,
          }),
          fast: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.proposeGasPrice,
            speed: GasSpeed.FAST,
            waitTime: chainWaitTime.proposedWait,
          }),
          normal: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.safeGasPrice,
            speed: GasSpeed.NORMAL,
            waitTime: chainWaitTime.safeWait,
          }),
        };
      }
    }, [chainId, data]);

  const gasFee = useMemo(() => {
    if (chainId === chain.mainnet.id) {
      return add(
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[selectedSpeed]?.maxBaseFee
          ?.amount,
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[selectedSpeed]
          ?.maxPriorityFeePerGas?.amount,
      );
    } else {
      return (gasFeeParamsBySpeed as GasFeeLegacyParamsBySpeed)[selectedSpeed]
        ?.gasPrice?.amount;
    }
  }, [chainId, gasFeeParamsBySpeed, selectedSpeed]);

  useEffect(() => {
    setSelectedGas({ selectedGas: gasFeeParamsBySpeed[selectedSpeed] });
  }, [gasFeeParamsBySpeed, selectedGas.option, selectedSpeed, setSelectedGas]);

  return {
    data,
    gasFeeParamsBySpeed,
    gasFee,
    setSelectedSpeed,
    selectedSpeed,
    isLoading,
  };
};
