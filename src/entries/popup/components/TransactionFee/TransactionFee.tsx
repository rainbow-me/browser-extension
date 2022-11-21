import BigNumber from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';
import React, { useMemo, useState } from 'react';
import { Chain, chain } from 'wagmi';

import { useMeteorology } from '~/core/resources/meteorology';
import { MeterologyResponse } from '~/core/resources/meteorology/gas';
import { add, multiply } from '~/core/utils/numbers';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';

import { ChainBadge } from '../ChainBadge/ChainBadge';

import { Speed, SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type TransactionFeeProps = {
  chainId: Chain['id'];
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

const parseSpeedGwei = (basefee: string, speed: Speed) => {
  return new BigNumber(
    formatUnits(
      new BigNumber(multiply(basefee, getBaseFeeMultiplier(speed))).toFixed(0),
      'gwei',
    ),
  ).toFixed(0);
};

const parseGwei = (basefee: string) => {
  return new BigNumber(formatUnits(basefee, 'gwei')).toFixed(0);
};

export function TransactionFee({ chainId }: TransactionFeeProps) {
  const { data } = useMeteorology({ chainId }, { refetchInterval: 5000 });
  const [speed, setSpeed] = useState<Speed>('normal');

  console.log('data', data);

  const speedGasLimits = useMemo(() => {
    const baseFeeSuggestion = (data as MeterologyResponse).data
      .baseFeeSuggestion;
    const currentBaseFee = (data as MeterologyResponse).data.currentBaseFee;
    const maxPriorityFeeSuggestions = (data as MeterologyResponse).data
      .maxPriorityFeeSuggestions;

    const speeds = {
      custom: `${parseGwei(
        add(currentBaseFee, maxPriorityFeeSuggestions.normal),
      )} - ${parseSpeedGwei(
        add(baseFeeSuggestion, maxPriorityFeeSuggestions.normal),
        'custom',
      )}`,
      normal: `${parseGwei(
        add(currentBaseFee, maxPriorityFeeSuggestions.normal),
      )} - ${parseSpeedGwei(
        add(baseFeeSuggestion, maxPriorityFeeSuggestions.normal),
        'normal',
      )}`,
      fast: `${parseGwei(
        add(currentBaseFee, maxPriorityFeeSuggestions.fast),
      )} - ${parseSpeedGwei(
        add(baseFeeSuggestion, maxPriorityFeeSuggestions.fast),
        'fast',
      )}`,
      urgent: `${parseGwei(
        add(currentBaseFee, maxPriorityFeeSuggestions.urgent),
      )} - ${parseSpeedGwei(
        add(baseFeeSuggestion, maxPriorityFeeSuggestions.urgent),
        'urgent',
      )}`,
    };
    return speeds;
  }, [data]);

  return (
    <Columns alignHorizontal="justify" alignVertical="center">
      <Column>
        <Rows space="8px">
          <Row>
            <Text weight="semibold" color="labelQuaternary" size="12pt">
              Estimated fee
            </Text>
          </Row>
          <Row>
            <Inline alignVertical="center" space="4px">
              <ChainBadge chainId={1} size="small" />
              <Text weight="semibold" color="label" size="14pt">
                0.0007 ~ 1min
              </Text>
            </Inline>
          </Row>
        </Rows>
      </Column>
      <Column>
        <Inline space="6px" alignVertical="center" alignHorizontal="right">
          <SwitchTransactionSpeedMenu
            speed={speed}
            onSpeedChanged={setSpeed}
            chainId={chain.mainnet.id}
            speedGasLimits={speedGasLimits}
          />
          <Box
            borderRadius="round"
            boxShadow="12px accent"
            display="flex"
            alignItems="center"
            justifyContent="center"
            background="fillSecondary"
            style={{ height: 28, width: 28 }}
          >
            <Symbol weight="medium" symbol="slider.horizontal.3" size={12} />
          </Box>
        </Inline>
      </Column>
    </Columns>
  );
}
