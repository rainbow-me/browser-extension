import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

import { ETH_ADDRESS } from '~/core/references';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import {
  convertRawAmountToBalance,
  convertRawAmountToDecimalFormat,
  convertRawAmountToNativeDisplay,
  divide,
  handleSignificantDecimals,
  multiply,
} from '~/core/utils/numbers';

const getExchangeIconUrl = (protocol: string): string | null => {
  if (!protocol) return null;
  const parsedProtocol = protocol?.replace(' ', '')?.toLowerCase();
  return `https://raw.githubusercontent.com/rainbow-me/assets/master/exchanges/${parsedProtocol}.png`;
};

const parseExchangeName = (name: string) => {
  const networks = Object.keys(ChainName).map((network) =>
    network.toLowerCase(),
  );

  const removeNetworks = (name: string) =>
    networks.some((network) => name.toLowerCase().includes(network))
      ? name.slice(name.indexOf('_') + 1, name.length)
      : name;

  const removeBridge = (name: string) => name.replace('-bridge', '');

  return removeNetworks(removeBridge(name));
};

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
  const bridges = useMemo(
    () => (quote as CrosschainQuote)?.routes?.[0]?.usedBridgeNames || [],
    [quote],
  );

  const minimumReceived = useMemo(
    () =>
      `${
        convertRawAmountToBalance(quote.buyAmount.toString(), {
          decimals: assetToBuy?.decimals,
        }).display
      } ${assetToBuy.symbol}`,
    [assetToBuy?.decimals, assetToBuy.symbol, quote.buyAmount],
  );

  const swappingRoute = useMemo(
    () =>
      quote.protocols?.map(({ name }) => ({
        name: parseExchangeName(name),
        icon: getExchangeIconUrl(parseExchangeName(name)),
        isBridge: bridges.includes(name),
      })),
    [bridges, quote.protocols],
  );

  const includedFee = useMemo(() => {
    const feePercentage = convertRawAmountToBalance(
      quote.feePercentageBasisPoints,
      {
        decimals: 18,
      },
    ).amount;
    return [
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
      `${multiply(feePercentage, 100)}%`,
    ];
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
