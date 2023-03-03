import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import { useEffect } from 'react';

import { ParsedAddressAsset } from '~/core/types/assets';
import { convertRawAmountToBalance } from '~/core/utils/numbers';

import { IndependentField } from './useSwapInputs';

interface SwapQuoteHandlerProps {
  assetToBuy: ParsedAddressAsset | null;
  assetToSell: ParsedAddressAsset | null;
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
  useEffect(() => {
    console.log('-- quote', quote);
    if (!(quote as QuoteError)?.error) {
      const { sellAmount, buyAmount } = (quote || {}) as
        | Quote
        | CrosschainQuote;
      if (independentField === 'sellField' && assetToBuy) {
        setAssetToBuyValue(
          buyAmount
            ? convertRawAmountToBalance(String(buyAmount), assetToBuy).amount
            : '',
        );
      } else if (independentField === 'buyField' && assetToSell) {
        setAssetToSellValue(
          sellAmount
            ? convertRawAmountToBalance(String(sellAmount), assetToSell).amount
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
    quote,
    setAssetToBuyValue,
    setAssetToSellValue,
  ]);
};
