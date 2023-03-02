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

const SWAP_POLLING_INTERVAL = 5000;

interface UseSwapQuotesProps {
  assetToSell: ParsedAddressAsset | null;
  assetToReceive: ParsedAddressAsset | null;
  assetToSellValue?: string;
  assetToReceiveValue?: string;
  independentField: IndependentField;
}

export const useSwapQuotes = ({
  assetToSell,
  assetToReceive,
  assetToSellValue,
  assetToReceiveValue,
  independentField,
}: UseSwapQuotesProps) => {
  const { currentAddress } = useCurrentAddressStore();

  const isCrosschainSwap = useMemo(
    () =>
      assetToSell &&
      assetToReceive &&
      assetToSell?.chainId !== assetToReceive?.chainId,
    [assetToReceive, assetToSell],
  );

  const quotesParams: QuoteParams | undefined = useMemo(() => {
    const paramsReady =
      assetToSell &&
      assetToReceive &&
      (independentField === 'toReceive'
        ? assetToReceiveValue
        : assetToSellValue);
    if (!paramsReady) return undefined;

    return {
      // source?: Source;
      chainId: assetToSell.chainId,
      fromAddress: currentAddress,
      sellTokenAddress: assetToSell.address,
      buyTokenAddress: assetToReceive.address,
      sellAmount:
        independentField === 'toSell'
          ? convertAmountToRawAmount(
              assetToSellValue || '0',
              assetToSell.decimals,
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
        : assetToSell.chainId,
    };
  }, [
    assetToReceive,
    assetToReceiveValue,
    assetToSell,
    assetToSellValue,
    currentAddress,
    independentField,
    isCrosschainSwap,
  ]);

  const { data, isLoading, isError } = useQuery({
    queryFn: () =>
      quotesParams &&
      (isCrosschainSwap ? getCrosschainQuote : getQuote)(quotesParams),
    queryKey: ['getQuote', quotesParams],
    enabled: !!quotesParams,
    refetchInterval: SWAP_POLLING_INTERVAL,
  });

  return { data, isLoading, isError };
};
