import BigNumber from 'bignumber.js';
import { Chain, chain } from 'wagmi';

import {
  BlocksToConfirmation,
  GasFeeLegacyParams,
  GasFeeParam,
  GasFeeParams,
  GasSpeed,
} from '../types/gas';

import { addHexPrefix, gweiToWei, weiToGwei } from './ethereum';
import { add, convertStringToHex, divide, lessThan, multiply } from './numbers';
import { getMinimalTimeUnitStringForMs } from './time';

export const parseGasDataConfirmationTime = (
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

export const parseGasFeeParam = ({ wei }: { wei: string }): GasFeeParam => {
  const gwei = weiToGwei(wei);
  return {
    amount: wei,
    display: `${gwei} Gwei`,
    gwei,
  };
};

export const parseGasFeeParams = ({
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

  const baseFee = lessThan(currentBaseFee, maxBaseFee.amount)
    ? currentBaseFee
    : maxBaseFee.amount;

  const display = `${new BigNumber(
    weiToGwei(add(baseFee, maxPriorityFeePerGas.amount)),
  ).toFixed(0)} - ${new BigNumber(
    weiToGwei(add(wei, maxPriorityFeePerGas.amount)),
  ).toFixed(0)} Gwei`;

  const estimatedTime = parseGasDataConfirmationTime(
    maxBaseFee.amount,
    maxPriorityFeePerGas.amount,
    blocksToConfirmation,
  );

  const transactionGasParams = {
    maxPriorityFeePerGas: addHexPrefix(
      convertStringToHex(maxPriorityFeePerGas.amount),
    ),
    maxFeePerGas: addHexPrefix(
      convertStringToHex(add(maxPriorityFeePerGas.amount, maxBaseFee.amount)),
    ),
  };
  return {
    maxBaseFee,
    maxPriorityFeePerGas,
    display,
    option: speed,
    estimatedTime,
    transactionGasParams,
  };
};

export const parseGasFeeLegacyParams = ({
  gwei,
  speed,
  waitTime,
}: {
  gwei: string;
  speed: GasSpeed;
  waitTime: number;
}): GasFeeLegacyParams => {
  const wei = gweiToWei(gwei);
  const gasPrice = parseGasFeeParam({
    wei: new BigNumber(multiply(wei, getBaseFeeMultiplier(speed))).toFixed(0),
  });
  const display = parseGasFeeParam({ wei }).display;

  const estimatedTime = {
    amount: waitTime,
    display: getMinimalTimeUnitStringForMs(Number(multiply(waitTime, 1000))),
  };
  const transactionGasParams = {
    gasPrice: addHexPrefix(convertStringToHex(gasPrice.amount)),
  };
  return {
    gasPrice,
    display,
    option: speed,
    estimatedTime,
    transactionGasParams,
  };
};

export const getBaseFeeMultiplier = (speed: GasSpeed) => {
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

export const getChainWaitTime = (chainId: Chain['id']) => {
  switch (chainId) {
    case chain.polygon.id:
      return { safeWait: 6, proposedWait: 3, fastWait: 3 };
    case chain.optimism.id:
      return { safeWait: 20, proposedWait: 20, fastWait: 20 };
    case chain.arbitrum.id:
      return { safeWait: 8, proposedWait: 8, fastWait: 8 };
    default:
      return { safeWait: 8, proposedWait: 8, fastWait: 8 };
  }
};
