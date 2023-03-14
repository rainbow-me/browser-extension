import { TransactionRequest } from '@ethersproject/abstract-provider';
import {
  CrosschainQuote,
  Quote,
  QuoteError,
  RAINBOW_ROUTER_CONTRACT_ADDRESS,
} from '@rainbow-me/swaps';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { assetNeedsUnlocking } from '~/core/raps/actions';
import { gasUnits } from '~/core/references';
import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
import { useEstimateSwapGasLimit } from '~/core/resources/gas/estimateSwapGasLimit';
import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
} from '~/core/resources/gas/meteorology';
import { useOptimismL1SecurityFee } from '~/core/resources/gas/optimismL1SecurityFee';
import {
  useCurrentAddressStore,
  useCurrentCurrencyStore,
  useGasStore,
} from '~/core/state';
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
  gasFeeParamsChanged,
  parseCustomGasFeeParams,
  parseGasFeeParamsBySpeed,
} from '~/core/utils/gas';

import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';

const useGas = ({
  chainId,
  defaultSpeed,
  estimatedGasLimit,
  optimismL1SecurityFee,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  estimatedGasLimit?: string;
  optimismL1SecurityFee?: string;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data: gasData, isLoading } = useGasData({ chainId });
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

      const maxPriorityFeePerGas = (
        storeGasFeeParamsBySpeed?.custom as GasFeeParams
      ).maxPriorityFeePerGas.amount;

      const newCustomSpeed = parseCustomGasFeeParams({
        currentBaseFee,
        maxPriorityFeeWei: maxPriorityFeePerGas,
        speed: GasSpeed.CUSTOM,
        baseFeeWei: gweiToWei(maxBaseFee || '0'),
        blocksToConfirmation,
        gasLimit: estimatedGasLimit || `${gasUnits.basic_transfer}`,
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

  const setCustomMaxPriorityFee = useCallback(
    (maxPriorityFee = '0') => {
      if (!gasData) return;
      const { data } = gasData as MeteorologyResponse;
      const currentBaseFee = data.currentBaseFee;

      const blocksToConfirmation = {
        byBaseFee: data.blocksToConfirmationByBaseFee,
        byPriorityFee: data.blocksToConfirmationByPriorityFee,
      };

      const maxBaseFee = (storeGasFeeParamsBySpeed?.custom as GasFeeParams)
        .maxBaseFee.amount;

      const newCustomSpeed = parseCustomGasFeeParams({
        currentBaseFee,
        maxPriorityFeeWei: gweiToWei(maxPriorityFee || '0'),
        speed: GasSpeed.CUSTOM,
        baseFeeWei: maxBaseFee,
        blocksToConfirmation,
        gasLimit: estimatedGasLimit || `${gasUnits.basic_transfer}`,
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
          gasLimit: estimatedGasLimit || `${gasUnits.basic_transfer}`,
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
  });
};

export const useSwapGas = ({
  chainId,
  defaultSpeed,
  tradeDetails,
  assetToSell,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  tradeDetails?: Quote | CrosschainQuote | QuoteError;
  assetToSell?: ParsedSearchAsset;
}) => {
  const [needsUnlocking, setNeedsUnlocking] = useState(false);
  const { currentAddress } = useCurrentAddressStore();

  const { data: estimatedGasLimit } = useEstimateSwapGasLimit({
    chainId,
    tradeDetails,
    requiresApprove: needsUnlocking,
  });

  const transactionRequest: TransactionRequest | null = useMemo(() => {
    if (tradeDetails && !(tradeDetails as QuoteError).error) {
      const quote = tradeDetails as Quote | CrosschainQuote;
      const { to, from, value, data } = quote;
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
  }, [chainId, tradeDetails]);

  const { data: optimismL1SecurityFee } = useOptimismL1SecurityFee(
    { transactionRequest: transactionRequest || {} },
    { enabled: chainId === ChainId.optimism && !!transactionRequest },
  );

  useEffect(() => {
    const checkIfNeedsUnlocking = async () => {
      if (tradeDetails && !(tradeDetails as QuoteError).error && assetToSell) {
        const quote = tradeDetails as Quote | CrosschainQuote;
        const needsUnlocking = await assetNeedsUnlocking({
          owner: currentAddress,
          amount: quote?.sellAmount.toString(),
          assetToUnlock: assetToSell,
          spender: RAINBOW_ROUTER_CONTRACT_ADDRESS,
          chainId,
        });
        setNeedsUnlocking(needsUnlocking);
      }
    };
    checkIfNeedsUnlocking();
  }, [assetToSell, chainId, currentAddress, tradeDetails]);

  return useGas({
    chainId,
    defaultSpeed,
    estimatedGasLimit,
    optimismL1SecurityFee,
  });
};
