/* eslint-disable no-nested-ternary */
import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Address, formatGwei, parseGwei } from 'viem';

import { useEstimateGasLimit, useGasData } from '~/core/resources/gas';
import { useEstimateApprovalGasLimit } from '~/core/resources/gas/estimateApprovalGasLimit';
import { useEstimateSwapGasLimit } from '~/core/resources/gas/estimateSwapGasLimit';
import {
  isMeteorologyEIP1559,
  isMeteorologyLegacy,
} from '~/core/resources/gas/meteorology';
import { useOptimismL1SecurityFee } from '~/core/resources/gas/optimismL1SecurityFee';
import { useCurrentCurrencyStore, useGasStore } from '~/core/state';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ParsedAsset, ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
  isEIP1559Gas,
} from '~/core/types/gas';
import { TransactionRequest } from '~/core/types/transactions';
import {
  gasFeeParamsChanged,
  parseCustomGasFeeLegacyParams,
  parseCustomGasFeeParams,
  parseGasFeeParamsBySpeed,
} from '~/core/utils/gas';
import { isQuoteError } from '~/core/utils/swaps';

import { useDebounce } from './useDebounce';
import usePrevious from './usePrevious';
import { useUserNativeAsset } from './useUserNativeAsset';

const useGas = ({
  chainId,
  address,
  defaultSpeed = GasSpeed.NORMAL,
  estimatedGasLimit,
  transactionRequest,
  enabled,
  additionalTime,
}: {
  chainId: ChainId;
  address?: Address;
  defaultSpeed?: GasSpeed;
  estimatedGasLimit?: bigint;
  transactionRequest: TransactionRequest | null;
  enabled?: boolean;
  additionalTime?: number;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data: gasData, isLoading } = useGasData({ chainId });
  const { nativeAsset } = useUserNativeAsset({ chainId, address });
  const needsSecurityFee = useNetworkStore((state) =>
    state.getNeedsL1SecurityFeeChainIds(),
  ).includes(chainId);
  const chainGasUnits = useNetworkStore((state) =>
    state.getChainGasUnits(chainId),
  );
  const prevDefaultSpeed = usePrevious(defaultSpeed);

  const [internalMaxPriorityFee, setInternalMaxPriorityFee] = useState('');
  const [internalMaxBaseFee, setInternalMaxBaseFee] = useState('');
  const [internalGasPrice, setInternalGasPrice] = useState('');

  const feeType = gasData?.meta?.feeType;
  const debouncedEstimatedGasLimit = useDebounce(estimatedGasLimit, 500);
  const debouncedMaxPriorityFee = useDebounce(internalMaxPriorityFee, 300);
  const prevDebouncedMaxPriorityFee = usePrevious(debouncedMaxPriorityFee);
  const debouncedMaxBaseFee = useDebounce(internalMaxBaseFee, 300);
  const prevDebouncedMaxBaseFee = usePrevious(debouncedMaxBaseFee);
  const debouncedGasPrice = useDebounce(internalGasPrice, 300);
  const prevDebouncedGasPrice = usePrevious(debouncedGasPrice);

  const prevChainId = usePrevious(chainId);

  const { data: optimismL1SecurityFee } = useOptimismL1SecurityFee(
    {
      transactionRequest: useDebounce(transactionRequest || {}, 500),
      chainId,
    },
    { enabled: needsSecurityFee },
  );

  const {
    selectedGas,
    setSelectedGas,
    gasFeeParamsBySpeed: storeGasFeeParamsBySpeed,
    setGasFeeParamsBySpeed,
    customGasModified,
    setCustomSpeed,
    setCustomLegacySpeed,
    clearCustomGasModified,
  } = useGasStore();

  const setCustomMaxBaseFee = useCallback((maxBaseFee = '0') => {
    setInternalMaxBaseFee(maxBaseFee);
  }, []);

  const setCustomMaxPriorityFee = useCallback((maxPriorityFee = '0') => {
    setInternalMaxPriorityFee(maxPriorityFee);
  }, []);

  const setCustomGasPrice = useCallback((gasPrice = '0') => {
    setInternalGasPrice(gasPrice);
  }, []);

  useQuery({
    queryKey: [
      'customSpeedByBaseFee',
      gasData,
      prevDebouncedMaxBaseFee,
      debouncedMaxBaseFee,
      enabled,
      feeType,
      nativeAsset,
      chainId,
      currentCurrency,
      estimatedGasLimit,
    ],
    queryFn: () => {
      if (!gasData || !isMeteorologyEIP1559(gasData) || !nativeAsset) return;

      const { data } = gasData;
      const currentBaseFee = data.currentBaseFee;
      const secondsPerNewBlock = data.secondsPerNewBlock;

      const blocksToConfirmation = {
        byBaseFee: data.blocksToConfirmationByBaseFee,
        byPriorityFee: data.blocksToConfirmationByPriorityFee,
      };

      const customGas = storeGasFeeParamsBySpeed?.custom;
      const maxPriorityFeePerGas =
        customGas && isEIP1559Gas(customGas)
          ? customGas.maxPriorityFeePerGas?.amount
          : 0n;

      const newCustomSpeed = parseCustomGasFeeParams({
        currentBaseFee,
        maxPriorityFeeWei: maxPriorityFeePerGas,
        speed: GasSpeed.CUSTOM,
        baseFeeWei: parseGwei(debouncedMaxBaseFee || '0'),
        blocksToConfirmation,
        gasLimit:
          estimatedGasLimit ?? BigInt(chainGasUnits.basic.tokenTransfer),
        nativeAsset,
        currency: currentCurrency,
        secondsPerNewBlock,
      });
      setCustomSpeed(newCustomSpeed);
      return newCustomSpeed;
    },
    enabled:
      !!gasData &&
      enabled &&
      feeType === 'eip1559' &&
      !!nativeAsset &&
      prevDebouncedMaxBaseFee !== debouncedMaxBaseFee,
  });

  useQuery({
    queryKey: [
      'customSpeedByPriorityFee',
      gasData,
      prevDebouncedMaxPriorityFee,
      debouncedMaxPriorityFee,
      enabled,
      feeType,
      nativeAsset,
      chainId,
      currentCurrency,
      estimatedGasLimit,
    ],
    queryFn: () => {
      if (!gasData || !isMeteorologyEIP1559(gasData) || !nativeAsset) return;

      const { data } = gasData;
      const currentBaseFee = data.currentBaseFee ?? 0;
      const secondsPerNewBlock = data.secondsPerNewBlock;

      const blocksToConfirmation = {
        byBaseFee: data.blocksToConfirmationByBaseFee,
        byPriorityFee: data.blocksToConfirmationByPriorityFee,
      };

      const customGas = storeGasFeeParamsBySpeed?.custom;
      const maxBaseFee =
        customGas && isEIP1559Gas(customGas)
          ? customGas.maxBaseFee?.amount
          : 0n;

      const maxPriorityFeeWei = parseGwei(debouncedMaxPriorityFee || '0');

      const newCustomSpeed = parseCustomGasFeeParams({
        currentBaseFee,
        maxPriorityFeeWei,
        speed: GasSpeed.CUSTOM,
        baseFeeWei: maxBaseFee,
        blocksToConfirmation,
        gasLimit:
          estimatedGasLimit ?? BigInt(chainGasUnits.basic.tokenTransfer),
        nativeAsset,
        currency: currentCurrency,
        secondsPerNewBlock,
      });
      setCustomSpeed(newCustomSpeed);
      return newCustomSpeed;
    },
    enabled:
      !!gasData &&
      enabled &&
      feeType === 'eip1559' &&
      !!nativeAsset &&
      prevDebouncedMaxPriorityFee !== debouncedMaxPriorityFee,
  });

  useQuery({
    queryKey: [
      'customLegacySpeed',
      gasData,
      enabled,
      debouncedGasPrice,
      prevDebouncedGasPrice,
      feeType,
      nativeAsset,
      chainId,
      currentCurrency,
      estimatedGasLimit,
    ],
    queryFn: () => {
      if (!nativeAsset) return;
      const newCustomSpeed = parseCustomGasFeeLegacyParams({
        speed: GasSpeed.CUSTOM,
        gasPriceWei: parseGwei(debouncedGasPrice || '0'),
        gasLimit:
          estimatedGasLimit ?? BigInt(chainGasUnits.basic.tokenTransfer),
        nativeAsset,
        currency: currentCurrency,
        waitTime: 0,
      });
      setCustomLegacySpeed(newCustomSpeed);
    },
    enabled:
      !!gasData &&
      enabled &&
      feeType === 'legacy' &&
      !!nativeAsset &&
      prevDebouncedGasPrice !== debouncedGasPrice,
  });

  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>(defaultSpeed);

  const gasFeeParamsBySpeed:
    | GasFeeParamsBySpeed
    | GasFeeLegacyParamsBySpeed
    | null = useMemo(() => {
    if (isLoading || !gasData || !nativeAsset) return null;

    const hasGasData =
      isMeteorologyEIP1559(gasData) || isMeteorologyLegacy(gasData);
    if (!hasGasData) return null;

    const newGasFeeParamsBySpeed = parseGasFeeParamsBySpeed({
      chainId,
      data: gasData,
      gasLimit:
        debouncedEstimatedGasLimit ?? BigInt(chainGasUnits.basic.tokenTransfer),
      nativeAsset,
      currency: currentCurrency,
      optimismL1SecurityFee,
      additionalTime,
    });

    if (
      customGasModified &&
      newGasFeeParamsBySpeed &&
      prevChainId === chainId &&
      storeGasFeeParamsBySpeed
    ) {
      newGasFeeParamsBySpeed.custom = storeGasFeeParamsBySpeed.custom;
    }
    return newGasFeeParamsBySpeed;
  }, [
    isLoading,
    gasData,
    nativeAsset,
    chainId,
    debouncedEstimatedGasLimit,
    currentCurrency,
    optimismL1SecurityFee,
    additionalTime,
    customGasModified,
    prevChainId,
    storeGasFeeParamsBySpeed,
    chainGasUnits.basic.tokenTransfer,
  ]);

  useEffect(() => {
    if (prevDefaultSpeed !== defaultSpeed) {
      setSelectedSpeed(defaultSpeed);
    }
  }, [defaultSpeed, prevDefaultSpeed]);

  useEffect(() => {
    if (
      enabled &&
      gasFeeParamsBySpeed?.[selectedSpeed] &&
      (gasFeeParamsChanged(selectedGas, gasFeeParamsBySpeed?.[selectedSpeed]) ||
        prevChainId !== chainId)
    ) {
      setSelectedGas({
        selectedGas: gasFeeParamsBySpeed[selectedSpeed],
      });
    }
  }, [
    chainId,
    enabled,
    gasFeeParamsBySpeed,
    prevChainId,
    selectedGas,
    selectedSpeed,
    setSelectedGas,
  ]);

  useEffect(() => {
    if (
      enabled &&
      gasFeeParamsBySpeed?.[selectedSpeed] &&
      (!storeGasFeeParamsBySpeed ||
        gasFeeParamsChanged(
          storeGasFeeParamsBySpeed[selectedSpeed],
          gasFeeParamsBySpeed[selectedSpeed],
        ) ||
        prevChainId !== chainId)
    ) {
      setGasFeeParamsBySpeed({
        gasFeeParamsBySpeed,
      });
    }
  }, [
    chainId,
    enabled,
    gasFeeParamsBySpeed,
    prevChainId,
    selectedSpeed,
    setGasFeeParamsBySpeed,
    storeGasFeeParamsBySpeed,
  ]);

  useEffect(() => {
    if (prevChainId !== chainId || !chainId) {
      clearCustomGasModified();
    }
  }, [chainId, clearCustomGasModified, prevChainId]);

  return {
    gasFeeParamsBySpeed,
    setSelectedSpeed,
    selectedSpeed,
    isLoading,
    setCustomMaxBaseFee,
    setCustomMaxPriorityFee,
    setCustomGasPrice,
    clearCustomGasModified,
    currentBaseFee: formatGwei(
      BigInt(
        (gasData && isMeteorologyEIP1559(gasData)
          ? gasData.data.currentBaseFee
          : undefined) || '0',
      ),
    ),
    baseFeeTrend:
      gasData && isMeteorologyEIP1559(gasData)
        ? gasData.data.baseFeeTrend
        : undefined,
    feeType: gasData?.meta?.feeType,
  };
};

export const useTransactionGas = ({
  chainId,
  address,
  defaultSpeed,
  transactionRequest,
}: {
  chainId: ChainId;
  address?: Address;
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
}) => {
  const { data: estimatedGasLimit } = useEstimateGasLimit({
    chainId,
    transactionRequest: useDebounce(transactionRequest, 500),
  });
  return useGas({
    chainId,
    address,
    defaultSpeed,
    estimatedGasLimit,
    transactionRequest,
    enabled: true,
  });
};

export const useSwapGas = ({
  chainId,
  defaultSpeed,
  quote,
  assetToSell,
  assetToBuy,
  enabled,
  quoteServiceTime,
}: {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  quote?: Quote | CrosschainQuote | QuoteError;
  assetToSell?: ParsedSearchAsset | ParsedAsset;
  assetToBuy?: ParsedSearchAsset | ParsedAsset;
  enabled?: boolean;
  quoteServiceTime?: number;
}) => {
  const { data: estimatedGasLimit } = useEstimateSwapGasLimit({
    chainId,
    quote,
    assetToSell,
    assetToBuy,
  });

  const transactionRequest: TransactionRequest | null = useMemo(() => {
    if (quote && !isQuoteError(quote)) {
      const { to, from, value, data } = quote;
      return {
        to,
        from,
        value: value != null ? BigInt(value) : undefined,
        chainId,
        data,
      };
    } else {
      return null;
    }
  }, [chainId, quote]);

  return useGas({
    chainId,
    defaultSpeed,
    estimatedGasLimit,
    transactionRequest,
    enabled,
    additionalTime: quoteServiceTime,
  });
};

export const useApprovalGas = ({
  chainId,
  address,
  assetAddress,
  spenderAddress,
  defaultSpeed,
  transactionRequest,
  assetType,
}: {
  chainId: ChainId;
  address: Address;
  assetAddress?: Address;
  spenderAddress?: Address;
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
  assetType: 'erc20' | 'nft';
}) => {
  const { data: estimatedGasLimit } = useEstimateApprovalGasLimit({
    chainId,
    ownerAddress: address,
    assetAddress,
    spenderAddress,
    assetType,
  });

  return useGas({
    chainId,
    address,
    defaultSpeed,
    estimatedGasLimit,
    transactionRequest,
    enabled: true,
  });
};
