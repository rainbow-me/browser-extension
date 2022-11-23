import BigNumber from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import {
  MeteorologyLegacyResponse,
  MeteorologyResponse,
  useMeteorology,
} from '~/core/resources/meteorology/gas';
import {
  BlocksToConfirmation,
  GasFeeLegacyParams,
  GasFeeLegacyParamsBySpeed,
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

const parseGasFeeLegacyParams = ({
  wei,
  speed,
}: {
  wei: string;
  speed: GasSpeed;
}): GasFeeLegacyParams => {
  const gasPrice = parseGasFeeParam({
    wei: new BigNumber(multiply(wei, getBaseFeeMultiplier(speed))).toFixed(0),
  });
  const display = parseGasFeeParam({ wei }).gwei;

  const estimatedTime = { amount: 1, display: '1sec' };
  return {
    gasPrice,
    display,
    option: speed,
    estimatedTime,
  };
};

export const useMeteorologyData = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data } = useMeteorology({ chainId }, { refetchInterval: 5000 });

  const [speed, setSpeed] = useState<GasSpeed>('normal');

  const blocksToConfirmation: BlocksToConfirmation | null = useMemo(() => {
    if (chainId === chain.mainnet.id) {
      const response = data as MeteorologyResponse;
      return {
        byBaseFee: response.data.blocksToConfirmationByBaseFee,
        byPriorityFee: response.data.blocksToConfirmationByPriorityFee,
      };
    }
    return null;
  }, [chainId, data]);

  const currentBaseFee = useMemo(() => {
    if (chainId === chain.mainnet.id) {
      const response = data as MeteorologyResponse;
      return parseGasFeeParam({
        wei: response.data.currentBaseFee,
      });
    }
    return null;
  }, [chainId, data]);

  const gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed =
    useMemo(() => {
      if (chainId === chain.mainnet.id) {
        const response = data as MeteorologyResponse;
        const currentBaseFee = response.data.currentBaseFee;
        const maxPriorityFeeSuggestions =
          response.data.maxPriorityFeeSuggestions;
        const baseFeeSuggestion = response.data.baseFeeSuggestion;
        return {
          custom: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'custom',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
          urgent: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'urgent',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
          fast: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'fast',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
          normal: parseGasFeeParams({
            currentBaseFee,
            maxPriorityFeeSuggestions,
            speed: 'normal',
            wei: baseFeeSuggestion,
            blocksToConfirmation: blocksToConfirmation as BlocksToConfirmation,
          }),
        };
      } else {
        const response = data as MeteorologyLegacyResponse;
        return {
          custom: parseGasFeeLegacyParams({
            wei: response.data.legacy.fastGasPrice,
            speed: 'custom',
          }),
          urgent: parseGasFeeLegacyParams({
            wei: response.data.legacy.fastGasPrice,
            speed: 'urgent',
          }),
          fast: parseGasFeeLegacyParams({
            wei: response.data.legacy.proposeGasPrice,
            speed: 'fast',
          }),
          normal: parseGasFeeLegacyParams({
            wei: response.data.legacy.safeGasPrice,
            speed: 'normal',
          }),
        };
      }
    }, [blocksToConfirmation, chainId, data]);

  const gasFee = useMemo(() => {
    if (chainId === chain.mainnet.id) {
      return add(
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed].maxBaseFee.amount,
        (gasFeeParamsBySpeed as GasFeeParamsBySpeed)[speed].maxPriorityFeePerGas
          .amount,
      );
    } else {
      return (gasFeeParamsBySpeed as GasFeeLegacyParamsBySpeed)[speed].gasPrice
        .amount;
    }
  }, [chainId, gasFeeParamsBySpeed, speed]);

  return { data, gasFeeParamsBySpeed, currentBaseFee, setSpeed, speed, gasFee };
};
