import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useEffect, useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import {
  SupportedCurrencyKey,
  ethUnits,
  supportedCurrencies,
} from '~/core/references';
import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
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
import {
  add,
  convertRawAmountToBalance,
  handleSignificantDecimals,
  multiply,
} from '~/core/utils/numbers';

import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';

export const useGas = ({
  chainId,
  transactionRequest,
}: {
  chainId: Chain['id'];
  transactionRequest: TransactionRequest;
}) => {
  const { data, isLoading } = useGasData({ chainId });
  const { data: gasLimitData } = useEstimateGasLimit({
    chainId,
    transactionRequest,
  });
  const { selectedGas, setSelectedGas } = useGasStore();
  const [selectedSpeed, setSelectedSpeed] = useState(GasSpeed.NORMAL);

  const asset = useNativeAssetForNetwork({ chainId });

  const gasLimit = gasLimitData?.gasLimit ?? ethUnits.basic_transfer;

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
    let amount = null;
    if (chainId === chain.mainnet.id) {
      amount = add(
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[selectedSpeed]?.maxBaseFee
          ?.amount,
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[selectedSpeed]
          ?.maxPriorityFeePerGas?.amount,
      );
    } else {
      amount = (gasFeeParamsBySpeed as GasFeeLegacyParamsBySpeed)[selectedSpeed]
        ?.gasPrice?.amount;
    }
    const totalWei = multiply(gasLimit, amount);
    const nativeTotalWei = convertRawAmountToBalance(
      totalWei,
      supportedCurrencies[asset?.symbol as SupportedCurrencyKey],
    ).amount;
    const display = handleSignificantDecimals(nativeTotalWei, 4);
    return { amount, display };
  }, [asset?.symbol, chainId, gasFeeParamsBySpeed, gasLimit, selectedSpeed]);

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
