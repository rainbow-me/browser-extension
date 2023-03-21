import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { ETH_ADDRESS } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertRawAmountToBalance,
  convertRawAmountToDecimalFormat,
  convertRawAmountToNativeDisplay,
  divide,
  handleSignificantDecimals,
  multiply,
} from '~/core/utils/numbers';

export const useSwapReviewDetails = ({
  quote,
  assetToBuy,
  assetToSell,
}: {
  assetToBuy: ParsedSearchAsset;
  assetToSell: ParsedSearchAsset;
  quote: Quote | CrosschainQuote;
}) => {
  const { currentCurrency } = useCurrentCurrencyStore();
  const minimumReceived = useMemo(
    () =>
      `${
        convertRawAmountToBalance(quote.buyAmount.toString(), {
          decimals: assetToBuy?.decimals,
        }).display
      } ${assetToBuy.symbol}`,
    [assetToBuy?.decimals, assetToBuy.symbol, quote.buyAmount],
  );

  const swappingRoute = useMemo(() => {
    const routeNames = quote.protocols?.map(({ name }) => name);
    return `${routeNames}`;
  }, [quote.protocols]);

  const includedFee = useMemo(() => {
    const feePercentage = convertRawAmountToBalance(
      quote.feePercentageBasisPoints,
      {
        decimals: 18,
      },
    ).amount;
    return {
      fee:
        assetToSell.address === ETH_ADDRESS
          ? convertRawAmountToNativeDisplay(
              quote.fee.toString(),
              assetToSell.decimals,
              assetToSell.price?.value || '0',
              currentCurrency,
            ).display
          : convertRawAmountToNativeDisplay(
              multiply(quote.buyAmount.toString(), feePercentage),
              assetToBuy.decimals,
              assetToBuy.price?.value || '0',
              currentCurrency,
            ).display,
      feePercentage,
    };
  }, [
    assetToBuy.decimals,
    assetToBuy.price?.value,
    assetToSell,
    currentCurrency,
    quote.buyAmount,
    quote.fee,
    quote.feePercentageBasisPoints,
  ]);

  const exchangeRate = useMemo(() => {
    const convertedSellAmount = convertRawAmountToDecimalFormat(
      quote.sellAmount.toString(),
      assetToSell.decimals,
    );

    const convertedBuyAmount = convertRawAmountToDecimalFormat(
      quote.buyAmount.toString(),
      assetToBuy.decimals,
    );

    const sellExecutionRateRaw = divide(
      convertedSellAmount,
      convertedBuyAmount,
    );

    const buyExecutionRateRaw = divide(convertedBuyAmount, convertedSellAmount);

    const sellExecutionRate = handleSignificantDecimals(
      sellExecutionRateRaw,
      2,
    );

    const buyExecutionRate = handleSignificantDecimals(buyExecutionRateRaw, 2);

    return [
      `1 ${assetToSell.symbol} for ${buyExecutionRate} ${assetToBuy.symbol}`,
      `1 ${assetToBuy.symbol} for ${sellExecutionRate} ${assetToSell.symbol}`,
    ];
  }, [
    assetToBuy.decimals,
    assetToBuy.symbol,
    assetToSell.decimals,
    assetToSell.symbol,
    quote.buyAmount,
    quote.sellAmount,
  ]);

  return {
    minimumReceived,
    swappingRoute,
    includedFee,
    exchangeRate,
  };
};
