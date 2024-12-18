import { CrosschainQuote, Quote } from '@rainbow-me/swaps';

import { i18n } from '../languages';
import { ParsedSearchAsset } from '../types/assets';

export const getQuoteServiceTime = ({
  quote,
}: {
  quote: Quote | CrosschainQuote;
}) => (quote as CrosschainQuote)?.routes?.[0]?.serviceTime || 0;

export const getCrossChainTimeEstimate = ({
  serviceTime,
}: {
  serviceTime?: number;
}): {
  isLongWait: boolean;
  timeEstimate?: number;
  timeEstimateDisplay: string;
} => {
  let isLongWait = false;
  let timeEstimateDisplay;
  const timeEstimate = serviceTime;

  const minutes = Math.floor((timeEstimate || 0) / 60);
  const hours = Math.floor(minutes / 60);

  if (hours >= 1) {
    isLongWait = true;
    timeEstimateDisplay = `>${hours} ${i18n.t(
      `time.hours.long.${hours === 1 ? 'singular' : 'plural'}`,
    )}`;
  } else if (minutes >= 1) {
    timeEstimateDisplay = `~${minutes} ${i18n.t(
      `time.minutes.short.${minutes === 1 ? 'singular' : 'plural'}`,
    )}`;
  } else {
    timeEstimateDisplay = `~${timeEstimate} ${i18n.t(
      `time.seconds.short.${timeEstimate === 1 ? 'singular' : 'plural'}`,
    )}`;
  }

  return {
    isLongWait,
    timeEstimate,
    timeEstimateDisplay,
  };
};

export const isWrapOrUnwrapEth = ({
  assetToBuy,
  assetToSell,
}: {
  assetToBuy: ParsedSearchAsset | null;
  assetToSell: ParsedSearchAsset | null;
}) => {
  return (
    assetToBuy?.chainId === assetToSell?.chainId &&
    ((assetToBuy?.type === 'native' &&
      assetToSell?.type === 'wrapped-native') ||
      (assetToSell?.type === 'native' && assetToBuy?.type === 'wrapped-native'))
  );
};
