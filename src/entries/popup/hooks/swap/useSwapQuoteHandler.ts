import {
  CrosschainQuote,
  Quote,
  QuoteError,
  configureSDK,
} from '@rainbow-me/swaps';
import { useEffect } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import { convertRawAmountToBalance } from '~/core/utils/numbers';

import usePrevious from '../usePrevious';

import { IndependentField } from './useSwapInputs';

const IS_TESTING = process.env.IS_TESTING === 'true';

IS_TESTING && configureSDK({ apiBaseUrl: 'http://127.0.0.1:3001' });

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
    if (quote && !(quote as QuoteError)?.error) {
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
            ? convertRawAmountToBalance(
                buyAmountDisplay?.toString(),
                assetToBuy,
              ).amount
            : '',
        );
      } else if (independentField === 'buyField' && assetToSell) {
        setAssetToSellValue(
          sellAmountDisplay
            ? convertRawAmountToBalance(
                sellAmountDisplay?.toString(),
                assetToSell,
              ).amount
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
