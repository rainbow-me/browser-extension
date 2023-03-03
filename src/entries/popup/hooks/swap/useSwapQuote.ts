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
  assetToBuy: ParsedAddressAsset | null;
  assetToSellValue?: string;
  assetToBuyValue?: string;
  independentField: IndependentField;
}

export const useSwapQuote = ({
  assetToSell,
  assetToBuy,
  assetToSellValue,
  assetToBuyValue,
  independentField,
}: UseSwapQuotesProps) => {
  const { currentAddress } = useCurrentAddressStore();

  const isCrosschainSwap = useMemo(
    () =>
      assetToSell && assetToBuy && assetToSell?.chainId !== assetToBuy?.chainId,
    [assetToBuy, assetToSell],
  );

  const quotesParams: QuoteParams | undefined = useMemo(() => {
    const paramsReady =
      assetToSell &&
      assetToBuy &&
      (independentField === 'buyField' ? assetToBuyValue : assetToSellValue);
    if (!paramsReady) return undefined;

    return {
      // source?: Source;
      // feePercentageBasisPoints?: number;
      chainId: assetToSell.chainId,
      fromAddress: currentAddress,
      sellTokenAddress: assetToSell.address,
      buyTokenAddress: assetToBuy.address,
      sellAmount:
        independentField === 'sellField'
          ? convertAmountToRawAmount(
              assetToSellValue || '0',
              assetToSell.decimals,
            )
          : undefined,
      buyAmount:
        independentField === 'buyField'
          ? convertAmountToRawAmount(
              assetToBuyValue || '0',
              assetToBuy.decimals,
            )
          : undefined,
      slippage: 0.3,
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
  ]);

  const { data, isLoading, isError } = useQuery({
    queryFn: () =>
      quotesParams &&
      (isCrosschainSwap ? getCrosschainQuote : getQuote)(quotesParams),
    queryKey: ['getSwapQuote', quotesParams],
    enabled: !!quotesParams,
    refetchInterval: SWAP_POLLING_INTERVAL,
  });

  return { data, isLoading, isError };
};
