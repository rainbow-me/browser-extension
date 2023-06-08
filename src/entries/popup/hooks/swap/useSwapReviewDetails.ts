import { CrosschainQuote, Quote } from '@rainbow-me/swaps';
import { useMemo } from 'react';

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
import { isUnwrapEth, isWrapEth } from '~/core/utils/swaps';

import { useNativeAssetForNetwork } from '../useNativeAssetForNetwork';

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
  const isWrapOrUnwrapEth = useMemo(() => {
    return (
      isWrapEth({
        buyTokenAddress: quote.buyTokenAddress,
        sellTokenAddress: quote.sellTokenAddress,
        chainId: assetToSell.chainId,
      }) ||
      isUnwrapEth({
        buyTokenAddress: quote.buyTokenAddress,
        sellTokenAddress: quote.sellTokenAddress,
        chainId: assetToSell.chainId,
      })
    );
  }, [assetToSell.chainId, quote.buyTokenAddress, quote.sellTokenAddress]);

  const buyAmountDisplay = isWrapOrUnwrapEth
    ? quote.buyAmount
    : quote.buyAmountDisplay;
  const sellAmountDisplay = isWrapOrUnwrapEth
    ? quote.sellAmount
    : quote.sellAmountDisplay;
  const feeInEth = isWrapOrUnwrapEth ? '0' : quote.feeInEth;

  const { currentCurrency } = useCurrentCurrencyStore();
  const nativeAsset = useNativeAssetForNetwork({
    chainId: assetToSell.chainId,
  });

  const bridges = useMemo(
    () => (quote as CrosschainQuote)?.routes?.[0]?.usedBridgeNames || [],
    [quote],
  );

  const minimumReceived = useMemo(
    () =>
      `${
        convertRawAmountToBalance(buyAmountDisplay?.toString(), {
          decimals: assetToBuy?.decimals,
        }).display
      } ${assetToBuy.symbol}`,
    [assetToBuy?.decimals, assetToBuy.symbol, buyAmountDisplay],
  );

  const swappingRoute = useMemo(
    () =>
      quote.protocols?.map(({ name, part }) => ({
        name: parseExchangeName(name),
        icon: getExchangeIconUrl(parseExchangeName(name)),
        isBridge: bridges.includes(name),
        part,
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
      convertRawAmountToNativeDisplay(
        feeInEth.toString(),
        nativeAsset?.decimals || 18,
        nativeAsset?.price?.value || '0',
        currentCurrency,
      ).display,
      `${handleSignificantDecimals(multiply(feePercentage, 100), 2)}%`,
    ];
  }, [
    currentCurrency,
    nativeAsset?.decimals,
    nativeAsset?.price?.value,
    feeInEth,
    quote.feePercentageBasisPoints,
  ]);

  const exchangeRate = useMemo(() => {
    const convertedSellAmount = convertRawAmountToDecimalFormat(
      sellAmountDisplay.toString(),
      assetToSell.decimals,
    );

    const convertedBuyAmount = convertRawAmountToDecimalFormat(
      buyAmountDisplay.toString(),
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
    buyAmountDisplay,
    sellAmountDisplay,
  ]);

  return {
    minimumReceived,
    swappingRoute,
    includedFee,
    exchangeRate,
  };
};
