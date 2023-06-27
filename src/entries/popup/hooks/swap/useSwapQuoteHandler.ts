import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import { useEffect } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertRawAmountToBalance,
  handleSignificantDecimals,
} from '~/core/utils/numbers';

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

  useEffect(() => {
    if (!(quote as QuoteError)?.error) {
      const { sellAmountDisplay, buyAmountDisplay } = (quote || {}) as
        | Quote
        | CrosschainQuote;

      if (
        (independentField === 'sellField' ||
          independentField === 'sellNativeField') &&
        assetToBuy
      ) {
        setAssetToBuyValue(
          buyAmountDisplay
            ? handleSignificantDecimals(
                convertRawAmountToBalance(
                  buyAmountDisplay?.toString(),
                  assetToBuy,
                ).amount,
                5,
              )
            : '',
        );
      } else if (independentField === 'buyField' && assetToSell) {
        setAssetToSellValue(
          sellAmountDisplay
            ? handleSignificantDecimals(
                convertRawAmountToBalance(
                  sellAmountDisplay?.toString(),
                  assetToSell,
                ).amount,
                5,
              )
            : '',
        );
      }
    } else {
      if (independentField === 'buyField') {
        setAssetToSellValue('');
      } else if (
        independentField === 'sellField' ||
        independentField === 'sellNativeField'
      ) {
        setAssetToBuyValue('');
      }
    }
  }, [
    assetToBuy,
    assetToSell,
    independentField,
    prevQuote,
    quote,
    setAssetToBuyValue,
    setAssetToSellValue,
  ]);
};
