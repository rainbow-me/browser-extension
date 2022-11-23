import { useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import { useGasData } from '~/core/resources/gas';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import { parseGasFeeLegacyParams, parseGasFeeParams } from '~/core/utils/gas';
import { add, multiply } from '~/core/utils/numbers';

export const useGas = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data: data } = useGasData({ chainId });

  const [speed, setSpeed] = useState<GasSpeed>('normal');

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed =
    useMemo(() => {
      if (chainId === chain.mainnet.id && data) {
        const response = data as MeteorologyResponse;
        const currentBaseFee = response.data.currentBaseFee;
        const maxPriorityFeeSuggestions =
          response.data.maxPriorityFeeSuggestions;
        const baseFeeSuggestion = response.data.baseFeeSuggestion;

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
        const polygonGasPriceBumpFactor = 1.05;

        return {
          custom: parseGasFeeLegacyParams({
            gwei: multiply(
              polygonGasPriceBumpFactor,
              response?.data.legacy.fastGasPrice,
            ),
            speed: 'custom',
          }),
          urgent: parseGasFeeLegacyParams({
            gwei: multiply(
              polygonGasPriceBumpFactor,
              response?.data.legacy.fastGasPrice,
            ),
            speed: 'urgent',
          }),
          fast: parseGasFeeLegacyParams({
            gwei: multiply(
              polygonGasPriceBumpFactor,
              response?.data.legacy.proposeGasPrice,
            ),
            speed: 'fast',
          }),
          normal: parseGasFeeLegacyParams({
            gwei: multiply(
              polygonGasPriceBumpFactor,
              response?.data.legacy.safeGasPrice,
            ),
            speed: 'normal',
          }),
        };
      }
    }, [chainId, data]);

  const gasFee = useMemo(() => {
    if (chainId === chain.mainnet.id) {
      return add(
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed]?.maxBaseFee?.amount,
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed]
          ?.maxPriorityFeePerGas?.amount,
      );
    } else {
      return (gasFeeParamsBySpeed as GasFeeLegacyParamsBySpeed)[speed]?.gasPrice
        ?.amount;
    }
  }, [chainId, gasFeeParamsBySpeed, speed]);

  return { data, gasFeeParamsBySpeed, gasFee, setSpeed, speed };
};
