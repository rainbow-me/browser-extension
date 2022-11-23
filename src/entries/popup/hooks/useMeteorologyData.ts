import { useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
  useMeteorology,
} from '~/core/resources/meteorology/gas';
import {
  BlocksToConfirmation,
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import {
  parseGasFeeLegacyParams,
  parseGasFeeParam,
  parseGasFeeParams,
} from '~/core/utils/gas';
import { add, multiply } from '~/core/utils/numbers';

export const useMeteorologyData = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data } = useMeteorology({ chainId }, { refetchInterval: 5000 });

  const [speed, setSpeed] = useState<GasSpeed>('normal');

  const blocksToConfirmation: BlocksToConfirmation | null = useMemo(() => {
    const response = data as MeteorologyResponse | undefined;
    if (chainId === chain.mainnet.id && response) {
      return {
        byBaseFee: response.data.blocksToConfirmationByBaseFee,
        byPriorityFee: response.data.blocksToConfirmationByPriorityFee,
      };
    }
    return null;
  }, [chainId, data]);

  const currentBaseFee = useMemo(() => {
    if (chainId === chain.mainnet.id && data) {
      const response = data as MeteorologyResponse;
      return parseGasFeeParam({
        wei: response.data.currentBaseFee,
      });
    }
    return null;
  }, [chainId, data]);

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed =
    useMemo(() => {
      if (chainId === chain.mainnet.id && data) {
        const response = data as MeteorologyResponse;
        const currentBaseFee = response.data.currentBaseFee;
        const maxPriorityFeeSuggestions =
          response.data.maxPriorityFeeSuggestions;
        const baseFeeSuggestion = response.data.baseFeeSuggestion;
        return {
          custom: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'custom',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
          urgent: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'urgent',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
          fast: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'fast',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
          normal: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'normal',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
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
    }, [blocksToConfirmation, chainId, data]);

  const gasFee = useMemo(() => {
    if (chainId === chain.mainnet.id) {
      return add(
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed]?.maxBaseFee
          ?.amount || '0',
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed]
          ?.maxPriorityFeePerGas?.amount || '0',
      );
    } else {
      return (gasFeeParamsBySpeed as GasFeeLegacyParamsBySpeed)[speed]?.gasPrice
        ?.amount;
    }
  }, [chainId, gasFeeParamsBySpeed, speed]);

  return { data, gasFeeParamsBySpeed, currentBaseFee, setSpeed, speed, gasFee };
};
