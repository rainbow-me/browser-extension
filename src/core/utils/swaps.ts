import {
  CrosschainQuote,
  ETH_ADDRESS,
  Quote,
  WRAPPED_ASSET,
} from '@rainbow-me/swaps';

import { i18n } from '../languages';
import { chainsNativeAsset } from '../references/chains';
import { useConnectedToHardhatStore } from '../state/currentSettings/connectedToHardhat';
import { ChainId } from '../types/chains';

import { isLowerCaseMatch } from './strings';

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
export const isUnwrapEth = ({
  buyTokenAddress,
  chainId,
  sellTokenAddress,
}: {
  chainId: ChainId;
  sellTokenAddress: string;
  buyTokenAddress: string;
}) => {
  const { connectedToHardhat } = useConnectedToHardhatStore.getState();
  return (
    isLowerCaseMatch(
      sellTokenAddress,
      WRAPPED_ASSET[connectedToHardhat ? ChainId.mainnet : chainId],
    ) && isLowerCaseMatch(buyTokenAddress, chainsNativeAsset[chainId])
  );
};

export const isWrapEth = ({
  buyTokenAddress,
  chainId,
  sellTokenAddress,
}: {
  chainId: ChainId;
  sellTokenAddress: string;
  buyTokenAddress: string;
}) => {
  const { connectedToHardhat } = useConnectedToHardhatStore.getState();
  return (
    isLowerCaseMatch(sellTokenAddress, ETH_ADDRESS) &&
    isLowerCaseMatch(
      buyTokenAddress,
      WRAPPED_ASSET[connectedToHardhat ? ChainId.mainnet : chainId],
    )
  );
};
