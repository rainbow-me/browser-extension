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
  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>('normal');

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
            speed: 'custom',
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
          urgent: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'urgent',
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
          fast: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'fast',
            wei: baseFeeSuggestion,
            blocksToConfirmation,
          }),
          normal: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'normal',
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
            speed: 'custom',
            waitTime: chainWaitTime.fastWait,
          }),
          urgent: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.fastGasPrice,
            speed: 'urgent',
            waitTime: chainWaitTime.fastWait,
          }),
          fast: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.proposeGasPrice,
            speed: 'fast',
            waitTime: chainWaitTime.proposedWait,
          }),
          normal: parseGasFeeLegacyParams({
            gwei: response?.data.legacy.safeGasPrice,
            speed: 'normal',
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
    if (selectedSpeed !== selectedGas.option) {
      setSelectedGas({ selectedGas: gasFeeParamsBySpeed[selectedSpeed] });
    }
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
