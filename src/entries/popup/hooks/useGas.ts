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
import {
  getChainWaitTime,
  parseGasFeeLegacyParams,
  parseGasFeeParams,
} from '~/core/utils/gas';
import { add } from '~/core/utils/numbers';

export const useGas = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data: data, isLoading } = useGasData({ chainId });

  const [speed, setSpeed] = useState<GasSpeed>('normal');

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
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed]?.maxBaseFee?.amount,
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed]
          ?.maxPriorityFeePerGas?.amount,
      );
    } else {
      return (gasFeeParamsBySpeed as GasFeeLegacyParamsBySpeed)[speed]?.gasPrice
        ?.amount;
    }
  }, [chainId, gasFeeParamsBySpeed, speed]);

  return { data, gasFeeParamsBySpeed, gasFee, setSpeed, speed, isLoading };
};
