import {
  CrosschainQuote,
  ETH_ADDRESS,
  Quote,
  QuoteError,
  QuoteParams,
  Source,
  SwapType,
  getCrosschainQuote,
  getQuote,
} from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { convertAmountToRawAmount } from '~/core/utils/numbers';

import { IndependentField } from './useSwapInputs';

const SWAP_POLLING_INTERVAL = 5000;
const CACHE_INTERVAL = 1000;

interface UseSwapQuotesProps {
  assetToSell: ParsedSearchAsset | null;
  assetToBuy: ParsedSearchAsset | null;
  assetToSellValue?: string;
  assetToBuyValue?: string;
  independentField: IndependentField;
  source: Source | 'auto';
  slippage: string;
}

export const useSwapQuote = ({
  assetToSell,
  assetToBuy,
  assetToSellValue,
  assetToBuyValue,
  independentField,
  slippage,
  source,
}: UseSwapQuotesProps) => {
  const { currentAddress } = useCurrentAddressStore();

  const isCrosschainSwap = useMemo(
    () =>
      !!assetToSell &&
      !!assetToBuy &&
      assetToSell?.chainId !== assetToBuy?.chainId,
    [assetToBuy, assetToSell],
  );

  const quotesParams: QuoteParams | undefined = useMemo(() => {
    const paramsReady =
      assetToSell &&
      assetToBuy &&
      (independentField === 'buyField'
        ? Number(assetToBuyValue)
        : Number(assetToSellValue));
    if (!paramsReady) return undefined;

    return {
      source: source === 'auto' ? undefined : source,
      chainId: assetToSell.chainId,
      fromAddress: currentAddress,
      sellTokenAddress: assetToSell.isNativeAsset
        ? ETH_ADDRESS
        : assetToSell.address,
      buyTokenAddress: assetToBuy.isNativeAsset
        ? ETH_ADDRESS
        : assetToBuy.address,
      sellAmount:
        independentField === 'sellField' && Number(assetToSellValue)
          ? convertAmountToRawAmount(
              assetToSellValue || '0',
              assetToSell.decimals,
            )
          : undefined,
      buyAmount:
        independentField === 'buyField' && Number(assetToBuyValue)
          ? convertAmountToRawAmount(
              assetToBuyValue || '0',
              assetToBuy.decimals,
            )
          : undefined,
      slippage: Number(slippage),
      refuel: false,
      swapType: isCrosschainSwap ? SwapType.crossChain : SwapType.normal,
      toChainId: isCrosschainSwap ? assetToBuy.chainId : assetToSell.chainId,
    };
  }, [
    assetToBuy,
    assetToBuyValue,
    assetToSell,
    assetToSellValue,
    currentAddress,
    independentField,
    isCrosschainSwap,
    slippage,
    source,
  ]);

  const { data, isLoading, isError, fetchStatus } = useQuery({
    queryFn: () =>
      quotesParams &&
      ((isCrosschainSwap ? getCrosschainQuote : getQuote)(
        quotesParams,
      ) as Promise<Quote | CrosschainQuote | QuoteError>),
    queryKey: ['getSwapQuote', quotesParams],
    enabled: !!quotesParams,
    refetchInterval: SWAP_POLLING_INTERVAL,
    cacheTime: CACHE_INTERVAL,
  });

  console.log('quotee data', assetToBuy);

  return {
    data,
    isLoading: isLoading && fetchStatus !== 'idle',
    isError,
    isCrosschainSwap,
  };
};
