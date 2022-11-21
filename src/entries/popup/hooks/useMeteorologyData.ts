import BigNumber from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';
import { Chain } from 'wagmi';

import {
  MeterologyResponse,
  useMeteorology,
} from '~/core/resources/meteorology/gas';
import { add, multiply } from '~/core/utils/numbers';

import {
  GasFeeParam,
  GasFeeParams,
  GasFeeParamsBySpeed,
} from '../components/TransactionFee/TransactionFee';
import { Speed } from '../components/TransactionFee/TransactionSpeedsMenu';

const weiToGwei = (wei: string) => {
  return new BigNumber(formatUnits(wei, 'gwei')).toFixed(0);
};

const parseGasFeeParam = ({ wei }: { wei: string }): GasFeeParam => {
  const gwei = weiToGwei(wei);
  return {
    amount: wei,
    display: `${gwei} Gwei`,
    gwei,
  };
};

const getBaseFeeMultiplier = (speed: Speed) => {
  switch (speed) {
    case 'urgent':
      return 1.1;
    case 'fast':
      return 1.05;
    case 'normal':
    default:
      return 1;
  }
};

const parseGasFeeParams = ({
  wei,
  currentBaseFee,
  speed,
  maxPriorityFeeSuggestions,
}: {
  wei: string;
  speed: Speed;
  maxPriorityFeeSuggestions: {
    fast: string;
    urgent: string;
    normal: string;
  };
  currentBaseFee: string;
}): GasFeeParams => {
  const maxBaseFee = parseGasFeeParam({
    wei: new BigNumber(multiply(wei, getBaseFeeMultiplier(speed))).toFixed(0),
  });
  const maxPriorityFeePerGas = parseGasFeeParam({
    wei: maxPriorityFeeSuggestions[speed === 'custom' ? 'urgent' : speed],
  });
  const display = `${add(
    parseGasFeeParam({ wei: currentBaseFee }).gwei,
    parseGasFeeParam({
      wei: maxPriorityFeePerGas.amount,
    }).gwei,
  )} - ${add(
    parseGasFeeParam({ wei }).gwei,
    parseGasFeeParam({
      wei: maxPriorityFeePerGas.amount,
    }).gwei,
  )}`;
  return {
    maxBaseFee,
    maxPriorityFeePerGas,
    display,
    option: speed,
    estimatedTime: { amount: 1, display: '1 min' },
  };
};

export const useMeteorologyData = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data } = useMeteorology({ chainId }, { refetchInterval: 5000 });
  const baseFeeSuggestion = (data as MeterologyResponse).data.baseFeeSuggestion;
  const currentBaseFee = (data as MeterologyResponse).data.currentBaseFee;
  const maxPriorityFeeSuggestions = (data as MeterologyResponse).data
    .maxPriorityFeeSuggestions;

  const baseFee = parseGasFeeParam({ wei: currentBaseFee });
  const speeds: GasFeeParamsBySpeed = {
    custom: parseGasFeeParams({
      currentBaseFee,
      maxPriorityFeeSuggestions,
      speed: 'custom',
      wei: baseFeeSuggestion,
    }),
    urgent: parseGasFeeParams({
      currentBaseFee,
      maxPriorityFeeSuggestions,
      speed: 'urgent',
      wei: baseFeeSuggestion,
    }),
    fast: parseGasFeeParams({
      currentBaseFee,
      maxPriorityFeeSuggestions,
      speed: 'fast',
      wei: baseFeeSuggestion,
    }),
    normal: parseGasFeeParams({
      currentBaseFee,
      maxPriorityFeeSuggestions,
      speed: 'normal',
      wei: baseFeeSuggestion,
    }),
  };

  return { data, speeds, baseFee };
};
