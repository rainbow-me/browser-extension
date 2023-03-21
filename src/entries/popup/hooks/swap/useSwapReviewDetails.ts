import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { ParsedSearchAsset } from '~/core/types/assets';
import {
  convertRawAmountToBalance,
  convertRawAmountToDecimalFormat,
  divide,
  handleSignificantDecimals,
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
    return {
      fee: quote.fee,
      feePercentageBasisPoints: quote.feePercentageBasisPoints,
    };
  }, [quote.fee, quote.feePercentageBasisPoints]);

  const exchangeRate = useMemo(() => {
    const convertedSellAmount = convertRawAmountToDecimalFormat(
      quote.sellAmount.toString(),
      quote.inputTokenDecimals,
    );

    const convertedBuyAmount = convertRawAmountToDecimalFormat(
      quote.buyAmount.toString(),
      quote.outputTokenDecimals,
    );

    const outputExecutionRateRaw = divide(
      convertedSellAmount,
      convertedBuyAmount,
    );

    const inputExecutionRateRaw = divide(
      convertedBuyAmount,
      convertedSellAmount,
    );

    const inputExecutionRate = handleSignificantDecimals(
      inputExecutionRateRaw,
      2,
    );

    const outputExecutionRate = handleSignificantDecimals(
      outputExecutionRateRaw,
      2,
    );

    return [
      `1 ${assetToSell.symbol} for ${outputExecutionRate} ${assetToBuy.symbol}`,
      `1 ${assetToBuy.symbol} for ${inputExecutionRate} ${assetToSell.symbol}`,
    ];
  }, [
    assetToBuy.symbol,
    assetToSell.symbol,
    quote.buyAmount,
    quote.inputTokenDecimals,
    quote.outputTokenDecimals,
    quote.sellAmount,
  ]);

  return {
    minimumReceived,
    swappingRoute,
    includedFee,
    exchangeRate,
  };
};
