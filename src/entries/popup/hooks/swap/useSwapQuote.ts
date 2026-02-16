import {
  ETH_ADDRESS,
  QuoteParams,
  Source,
  SwapType,
  getCrosschainQuote,
  getQuote,
} from '@rainbow-me/swaps';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { parseUnits } from 'viem';

import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedAsset, ParsedSearchAsset } from '~/core/types/assets';
import { isQuoteError } from '~/core/utils/swaps';

import { analyticsTrackQuoteFailed } from './analyticsTrackQuoteFailed';
import { IndependentField } from './useSwapInputs';

const SWAP_POLLING_INTERVAL = 5000;
const CACHE_INTERVAL = 1000;
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

interface UseSwapQuotesProps {
  assetToSell: ParsedSearchAsset | ParsedAsset | null;
  assetToBuy: ParsedSearchAsset | ParsedAsset | null;
  assetToSellValue?: string;
  assetToBuyValue?: string;
  independentField: IndependentField;
  source: Source | 'auto';
  slippage: string | number;
  isClaim?: boolean;
}

export const useSwapQuote = ({
  assetToSell,
  assetToBuy,
  assetToSellValue,
  assetToBuyValue,
  independentField,
  slippage,
  source,
  isClaim,
}: UseSwapQuotesProps) => {
  const { currentAddress } = useCurrentAddressStore();
  const currency = useCurrentCurrencyStore((s) => s.currentCurrency);

  const currentInputHash = `${assetToSell?.chainId}:${assetToSell?.address}:${assetToSellValue}:${assetToBuy?.chainId}:${assetToBuy?.address}`;
  const lastFetchedInputHashRef = useRef<string>();

  const isCrosschainSwap = useMemo(
    () =>
      !!assetToSell &&
      !!assetToBuy &&
      assetToSell?.chainId !== assetToBuy?.chainId,
    [assetToBuy, assetToSell],
  );

  const quotesParams = useMemo((): QuoteParams | undefined => {
    const independentValue =
      independentField === 'buyField'
        ? Number(assetToBuyValue)
        : Number(assetToSellValue);
    const paramsReady =
      assetToSell && assetToBuy && typeof independentValue === 'number';
    if (!paramsReady) return undefined;

    return {
      source: source === 'auto' ? undefined : source,
      chainId: assetToSell.chainId,
      fromAddress: currentAddress,
      sellTokenAddress: (assetToSell.isNativeAsset
        ? ETH_ADDRESS
        : assetToSell.address) as `0x${string}`,
      buyTokenAddress: (assetToBuy.isNativeAsset
        ? ETH_ADDRESS
        : assetToBuy.address) as `0x${string}`,
      sellAmount:
        (independentField === 'sellField' ||
          independentField === 'sellNativeField') &&
        Number(assetToSellValue)
          ? parseUnits(assetToSellValue || '0', assetToSell.decimals ?? 18)
          : undefined,
      buyAmount:
        independentField === 'buyField' && Number(assetToBuyValue)
          ? parseUnits(assetToBuyValue || '0', assetToBuy.decimals ?? 18)
          : undefined,
      slippage: Number(slippage),
      toChainId: isCrosschainSwap ? assetToBuy.chainId : assetToSell.chainId,
      feePercentageBasisPoints: INTERNAL_BUILD || isClaim ? 0 : undefined,
      currency,
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
    isClaim,
    currency,
  ]);

  const { data, isLoading, isError, fetchStatus } = useQuery({
    queryFn: async ({ signal }) => {
      if (!quotesParams) throw 'unreacheable';
      const quote = await (isCrosschainSwap ? getCrosschainQuote : getQuote)(
        quotesParams,
        signal,
      );
      if (quote && 'error' in quote) {
        analyticsTrackQuoteFailed(quote, {
          inputAsset: assetToSell,
          outputAsset: assetToBuy,
          inputAmount: assetToSellValue,
          outputAmount: assetToBuyValue,
        });
      }

      lastFetchedInputHashRef.current = currentInputHash;

      return quote ?? undefined;
    },
    queryKey: ['getSwapQuote', currentInputHash],
    enabled: !!quotesParams,
    refetchInterval: SWAP_POLLING_INTERVAL,
    gcTime: CACHE_INTERVAL,
    placeholderData: (previousData) => previousData,
  });

  const isRefetchingAfterInputChange = useMemo(() => {
    return (
      currentInputHash !== lastFetchedInputHashRef.current &&
      fetchStatus === 'fetching'
    );
  }, [currentInputHash, fetchStatus]);

  const isWrapOrUnwrapEth = useMemo(() => {
    if (!data || isQuoteError(data)) return false;
    return data.swapType === SwapType.wrap || data.swapType === SwapType.unwrap;
  }, [data]);

  const quote = useMemo(() => {
    if (!data || isQuoteError(data)) return data;
    return {
      ...data,
      buyAmountDisplay: isWrapOrUnwrapEth
        ? data.buyAmount
        : data.buyAmountDisplay,
      sellAmountDisplay: isWrapOrUnwrapEth
        ? data.sellAmount
        : data.sellAmountDisplay,
      feeInEth: isWrapOrUnwrapEth ? '0' : data.feeInEth,
      fromChainId: assetToSell?.chainId,
      toChainId: assetToBuy?.chainId,
    };
  }, [assetToBuy?.chainId, assetToSell?.chainId, data, isWrapOrUnwrapEth]);

  return {
    data: quote,
    isLoading: isLoading && fetchStatus !== 'idle',
    isRefetchingAfterInputChange,
    isRefetching: fetchStatus === 'fetching',
    isError,
    isCrosschainSwap,
    isWrapOrUnwrapEth,
  };
};
