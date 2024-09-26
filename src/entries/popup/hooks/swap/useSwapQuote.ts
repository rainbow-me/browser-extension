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

import { useCurrentAddressStore, useCurrentCurrencyStore } from '~/core/state';
import { ParsedAsset, ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { convertAmountToRawAmount } from '~/core/utils/numbers';
import { isUnwrapEth, isWrapEth } from '~/core/utils/swaps';

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

  const isCrosschainSwap = useMemo(
    () =>
      !!assetToSell &&
      !!assetToBuy &&
      assetToSell?.chainId !== assetToBuy?.chainId,
    [assetToBuy, assetToSell],
  );

  const quotesParams: QuoteParams | undefined = useMemo(() => {
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
      sellTokenAddress: assetToSell.isNativeAsset
        ? ETH_ADDRESS
        : assetToSell.address,
      buyTokenAddress: assetToBuy.isNativeAsset
        ? ETH_ADDRESS
        : assetToBuy.address,
      sellAmount:
        (independentField === 'sellField' ||
          independentField === 'sellNativeField') &&
        Number(assetToSellValue)
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
    queryFn: () =>
      quotesParams &&
      ((isCrosschainSwap ? getCrosschainQuote : getQuote)(
        quotesParams,
      ) as Promise<Quote | CrosschainQuote | QuoteError>),
    queryKey: ['getSwapQuote', quotesParams],
    enabled: !!quotesParams,
    refetchInterval: SWAP_POLLING_INTERVAL,
    gcTime: CACHE_INTERVAL,
    placeholderData: (previousData) => previousData,
  });

  const isWrapOrUnwrapEth = useMemo(() => {
    if (!data || (data as QuoteError).error) return false;
    const quote = data as Quote | CrosschainQuote;
    return (
      isWrapEth({
        buyTokenAddress: quote?.buyTokenAddress,
        sellTokenAddress: quote?.sellTokenAddress,
        chainId: assetToSell?.chainId || ChainId.mainnet,
      }) ||
      isUnwrapEth({
        buyTokenAddress: quote?.buyTokenAddress,
        sellTokenAddress: quote?.sellTokenAddress,
        chainId: assetToSell?.chainId || ChainId.mainnet,
      })
    );
  }, [assetToSell?.chainId, data]);

  const quote = useMemo(() => {
    if (!data || (data as QuoteError)?.error) return data;
    const quote = data as Quote | CrosschainQuote;
    return {
      ...quote,
      buyAmountDisplay: isWrapOrUnwrapEth
        ? quote.buyAmount
        : quote.buyAmountDisplay,
      sellAmountDisplay: isWrapOrUnwrapEth
        ? quote.sellAmount
        : quote.sellAmountDisplay,
      feeInEth: isWrapOrUnwrapEth ? '0' : quote.feeInEth,
      fromChainId: assetToSell?.chainId,
      toChainId: assetToBuy?.chainId,
    };
  }, [assetToBuy?.chainId, assetToSell?.chainId, data, isWrapOrUnwrapEth]);

  return {
    data: quote,
    isLoading: isLoading && fetchStatus !== 'idle',
    isError,
    isCrosschainSwap,
    isWrapOrUnwrapEth,
  };
};
