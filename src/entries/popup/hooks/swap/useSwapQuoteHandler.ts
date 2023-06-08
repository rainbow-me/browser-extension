import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import { useEffect, useMemo } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { convertRawAmountToBalance } from '~/core/utils/numbers';
import { isUnwrapEth, isWrapEth } from '~/core/utils/swaps';

import usePrevious from '../usePrevious';

import { IndependentField } from './useSwapInputs';

interface SwapQuoteHandlerProps {
  assetToBuy: ParsedSearchAsset | null;
  assetToSell: ParsedSearchAsset | null;
  independentField: IndependentField;
  quote?: Quote | CrosschainQuote | QuoteError | null;
  setAssetToBuyValue: (value: string) => void;
  setAssetToSellValue: (value: string) => void;
}

export const useSwapQuoteHandler = ({
  assetToBuy,
  assetToSell,
  quote,
  independentField,
  setAssetToBuyValue,
  setAssetToSellValue,
}: SwapQuoteHandlerProps) => {
  const prevQuote = usePrevious(quote);

  const isWrapOrUnwrapEth = useMemo(() => {
    if (!(quote as QuoteError)?.error && quote) {
      const q = quote as Quote;
      return (
        isWrapEth({
          buyTokenAddress: q.buyTokenAddress,
          sellTokenAddress: q.sellTokenAddress,
          chainId: assetToSell?.chainId || ChainId.mainnet,
        }) ||
        isUnwrapEth({
          buyTokenAddress: q.buyTokenAddress,
          sellTokenAddress: q.sellTokenAddress,
          chainId: assetToSell?.chainId || ChainId.mainnet,
        })
      );
    }
  }, [assetToSell?.chainId, quote]);

  useEffect(() => {
    if (!(quote as QuoteError)?.error) {
      const { sellAmountDisplay, buyAmountDisplay, buyAmount, sellAmount } =
        (quote || {}) as Quote | CrosschainQuote;

      const quoteBuyAmount = isWrapOrUnwrapEth ? buyAmount : buyAmountDisplay;
      const quoteSellAmount = isWrapOrUnwrapEth
        ? sellAmount
        : sellAmountDisplay;

      if (independentField === 'sellField' && assetToBuy) {
        setAssetToBuyValue(
          quoteBuyAmount
            ? convertRawAmountToBalance(quoteBuyAmount?.toString(), assetToBuy)
                .amount
            : '',
        );
      } else if (independentField === 'buyField' && assetToSell) {
        setAssetToSellValue(
          quoteSellAmount
            ? convertRawAmountToBalance(
                quoteSellAmount?.toString(),
                assetToSell,
              ).amount
            : '',
        );
      }
    } else {
      if (independentField === 'buyField') {
        setAssetToSellValue('');
      } else if (independentField === 'sellField') {
        setAssetToBuyValue('');
      }
    }
  }, [
    assetToBuy,
    assetToSell,
    independentField,
    isWrapOrUnwrapEth,
    prevQuote,
    quote,
    setAssetToBuyValue,
    setAssetToSellValue,
  ]);
};
