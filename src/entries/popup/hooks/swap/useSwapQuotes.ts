import {
  QuoteParams,
  SwapType,
  getCrosschainQuote,
  getQuote,
} from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { convertAmountToRawAmount } from '~/core/utils/numbers';

import { IndependentField } from './useSwapInputs';

interface UseSwapQuotesProps {
  assetToSwap: ParsedAddressAsset | null;
  assetToReceive: ParsedAddressAsset | null;
  assetToSwapValue?: string;
  assetToReceiveValue?: string;
  independentField: IndependentField;
}

export const useSwapQuotes = ({
  assetToSwap,
  assetToReceive,
  assetToSwapValue,
  assetToReceiveValue,
  independentField,
}: UseSwapQuotesProps) => {
  const { currentAddress } = useCurrentAddressStore();

  const isCrosschainSwap = useMemo(
    () =>
      assetToSwap &&
      assetToReceive &&
      assetToSwap?.chainId !== assetToReceive?.chainId,
    [assetToReceive, assetToSwap],
  );

  const quotesParams: QuoteParams | undefined = useMemo(() => {
    const paramsReady =
      assetToSwap &&
      assetToReceive &&
      (independentField === 'toReceive'
        ? assetToReceiveValue
        : assetToSwapValue);
    if (!paramsReady) return undefined;

    return {
      // source?: Source;
      chainId: assetToSwap.chainId,
      fromAddress: currentAddress,
      sellTokenAddress: assetToSwap.address,
      buyTokenAddress: assetToReceive.address,
      sellAmount:
        independentField === 'toSwap'
          ? convertAmountToRawAmount(
              assetToSwapValue || '0',
              assetToSwap.decimals,
            )
          : undefined,
      buyAmount:
        independentField === 'toReceive'
          ? convertAmountToRawAmount(
              assetToReceiveValue || '0',
              assetToReceive.decimals,
            )
          : undefined,
      slippage: 0.3,
      // destReceiver?: EthereumAddress;
      // refuel?: boolean;
      swapType: isCrosschainSwap ? SwapType.crossChain : SwapType.normal,
      // feePercentageBasisPoints?: number;
      toChainId: isCrosschainSwap
        ? assetToReceive.chainId
        : assetToSwap.chainId,
    };
  }, [
    assetToReceive,
    assetToReceiveValue,
    assetToSwap,
    assetToSwapValue,
    currentAddress,
    independentField,
    isCrosschainSwap,
  ]);

  const { data, isLoading } = useQuery({
    queryFn: () =>
      quotesParams &&
      (isCrosschainSwap ? getCrosschainQuote : getQuote)(quotesParams),
    queryKey: ['getQuote', quotesParams],
    enabled: !!quotesParams,
  });

  return { data, isLoading };
};
