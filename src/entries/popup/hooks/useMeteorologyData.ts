import BigNumber from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { Chain } from 'wagmi';

import {
  MeteorologyResponse,
  useMeteorology,
} from '~/core/resources/meteorology/gas';
import {
  BlocksToConfirmation,
  GasFeeParam,
  GasFeeParams,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
import { add, divide, lessThan, multiply } from '~/core/utils/numbers';
import { getMinimalTimeUnitStringForMs } from '~/core/utils/time';

const parseGasDataConfirmationTime = (
  maxBaseFee: string,
  maxPriorityFee: string,
  blocksToConfirmation: BlocksToConfirmation,
) => {
  let blocksToWaitForPriorityFee = 0;
  let blocksToWaitForBaseFee = 0;
  const { byPriorityFee, byBaseFee } = blocksToConfirmation;

  if (lessThan(maxPriorityFee, divide(byPriorityFee[4], 2))) {
    blocksToWaitForPriorityFee += 240;
  } else if (lessThan(maxPriorityFee, byPriorityFee[4])) {
    blocksToWaitForPriorityFee += 4;
  } else if (lessThan(maxPriorityFee, byPriorityFee[3])) {
    blocksToWaitForPriorityFee += 3;
  } else if (lessThan(maxPriorityFee, byPriorityFee[2])) {
    blocksToWaitForPriorityFee += 2;
  } else if (lessThan(maxPriorityFee, byPriorityFee[1])) {
    blocksToWaitForPriorityFee += 1;
  }

  if (lessThan(byBaseFee[4], maxBaseFee)) {
    blocksToWaitForBaseFee += 1;
  } else if (lessThan(byBaseFee[8], maxBaseFee)) {
    blocksToWaitForBaseFee += 4;
  } else if (lessThan(byBaseFee[40], maxBaseFee)) {
    blocksToWaitForBaseFee += 8;
  } else if (lessThan(byBaseFee[120], maxBaseFee)) {
    blocksToWaitForBaseFee += 40;
  } else if (lessThan(byBaseFee[240], maxBaseFee)) {
    blocksToWaitForBaseFee += 120;
  } else {
    blocksToWaitForBaseFee += 240;
  }

  // 1 hour as max estimate, 240 blocks
  const totalBlocksToWait =
    blocksToWaitForBaseFee +
    (blocksToWaitForBaseFee < 240 ? blocksToWaitForPriorityFee : 0);
  const timeAmount = 15 * totalBlocksToWait;

  return {
    amount: timeAmount,
    display: getMinimalTimeUnitStringForMs(Number(multiply(timeAmount, 1000))),
  };
};

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

const getBaseFeeMultiplier = (speed: GasSpeed) => {
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
  blocksToConfirmation,
}: {
  wei: string;
  speed: GasSpeed;
  maxPriorityFeeSuggestions: {
    fast: string;
    urgent: string;
    normal: string;
  };
  currentBaseFee: string;
  blocksToConfirmation: BlocksToConfirmation;
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
  const estimatedTime = parseGasDataConfirmationTime(
    maxBaseFee.amount,
    maxPriorityFeePerGas.amount,
    blocksToConfirmation,
  );
  return {
    maxBaseFee,
    maxPriorityFeePerGas,
    display,
    option: speed,
    estimatedTime,
  };
};

export const useMeteorologyData = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data } = useMeteorology({ chainId }, { refetchInterval: 5000 });
  const [speed, setSpeed] = useState<GasSpeed>('normal');

  const meteorologyData = data as MeteorologyResponse;

  const {
    data: {
      baseFeeSuggestion,
      currentBaseFee,
      maxPriorityFeeSuggestions,
      blocksToConfirmationByBaseFee,
      blocksToConfirmationByPriorityFee,
    },
  } = meteorologyData || { data: {} };

  const blocksToConfirmation: BlocksToConfirmation = useMemo(
    () => ({
      byBaseFee: blocksToConfirmationByBaseFee,
      byPriorityFee: blocksToConfirmationByPriorityFee,
    }),
    [blocksToConfirmationByBaseFee, blocksToConfirmationByPriorityFee],
  );

  const baseFee = parseGasFeeParam({ wei: currentBaseFee });

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed = useMemo(
    () => ({
      custom: parseGasFeeParams({
        currentBaseFee,
        maxPriorityFeeSuggestions,
        speed: 'custom',
        wei: baseFeeSuggestion,
        blocksToConfirmation,
      }),
      urgent: parseGasFeeParams({
        currentBaseFee,
        maxPriorityFeeSuggestions,
        speed: 'urgent',
        wei: baseFeeSuggestion,
        blocksToConfirmation,
      }),
      fast: parseGasFeeParams({
        currentBaseFee,
        maxPriorityFeeSuggestions,
        speed: 'fast',
        wei: baseFeeSuggestion,
        blocksToConfirmation,
      }),
      normal: parseGasFeeParams({
        currentBaseFee,
        maxPriorityFeeSuggestions,
        speed: 'normal',
        wei: baseFeeSuggestion,
        blocksToConfirmation,
      }),
    }),
    [
      baseFeeSuggestion,
      blocksToConfirmation,
      currentBaseFee,
      maxPriorityFeeSuggestions,
    ],
  );

  const gasFee = useMemo(
    () =>
      add(
        gasFeeParamsBySpeed[speed].maxBaseFee.amount,
        gasFeeParamsBySpeed[speed].maxPriorityFeePerGas.amount,
      ),
    [gasFeeParamsBySpeed, speed],
  );

  return { data, gasFeeParamsBySpeed, baseFee, setSpeed, speed, gasFee };
};
