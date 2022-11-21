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

interface GasFeeParam {
  amount: string;
  display: string;
  gwei: string;
}

interface GasFeeParams {
  maxBaseFee: GasFeeParam;
  maxPriorityFeePerGas: GasFeeParam;
  option: string;
  estimatedTime: { amount: number; display: string };
}

type GasFeeParamsBySpeed = {
  [key in Speed]: GasFeeParams;
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

const useMeteorologyData = ({ chainId }: { chainId: Chain['id'] }) => {
  const { data } = useMeteorology({ chainId }, { refetchInterval: 5000 });

  const baseFeeSuggestion = (data as MeterologyResponse).data.baseFeeSuggestion;
  const currentBaseFee = (data as MeterologyResponse).data.currentBaseFee;
  const maxPriorityFeeSuggestions = (data as MeterologyResponse).data
    .maxPriorityFeeSuggestions;

  const baseFee = parseGasFeeParam({ wei: currentBaseFee });
  const speeds: GasFeeParamsBySpeed = {
    custom: {
      maxBaseFee: parseGasFeeParam({ wei: baseFeeSuggestion }),
      maxPriorityFeePerGas: parseGasFeeParam({
        wei: maxPriorityFeeSuggestions.fast,
      }),
      option: 'custom',
      estimatedTime: { amount: 1, display: '1 min' },
    },
    urgent: {
      maxBaseFee: parseGasFeeParam({
        wei: new BigNumber(
          multiply(baseFeeSuggestion, getBaseFeeMultiplier('urgent')),
        ).toFixed(0),
      }),
      maxPriorityFeePerGas: parseGasFeeParam({
        wei: maxPriorityFeeSuggestions.urgent,
      }),
      option: 'urgent',
      estimatedTime: { amount: 1, display: '1 min' },
    },
    fast: {
      maxBaseFee: parseGasFeeParam({
        wei: new BigNumber(
          multiply(baseFeeSuggestion, getBaseFeeMultiplier('fast')),
        ).toFixed(0),
      }),
      maxPriorityFeePerGas: parseGasFeeParam({
        wei: maxPriorityFeeSuggestions.fast,
      }),
      option: 'fast',
      estimatedTime: { amount: 1, display: '1 min' },
    },
    normal: {
      maxBaseFee: parseGasFeeParam({
        wei: new BigNumber(
          multiply(baseFeeSuggestion, getBaseFeeMultiplier('normal')),
        ).toFixed(0),
      }),
      maxPriorityFeePerGas: parseGasFeeParam({
        wei: maxPriorityFeeSuggestions.fast,
      }),
      option: 'normal',
      estimatedTime: { amount: 1, display: '1 min' },
    },
  };

  return { data, speeds, baseFee };
};

export function TransactionFee({ chainId }: TransactionFeeProps) {
  const { speeds, baseFee } = useMeteorologyData({ chainId });
  const [speed, setSpeed] = useState<Speed>('normal');

  const speedGasLimits = useMemo(() => {
    const speedss = {
      custom: `${add(
        baseFee.gwei,
        speeds.custom.maxPriorityFeePerGas.gwei,
      )} - ${add(
        speeds.custom.maxBaseFee.gwei,
        speeds.custom.maxPriorityFeePerGas.gwei,
      )}`,
      normal: `${add(
        baseFee.gwei,
        speeds.normal.maxPriorityFeePerGas.gwei,
      )} - ${add(
        speeds.normal.maxBaseFee.gwei,
        speeds.normal.maxPriorityFeePerGas.gwei,
      )}`,
      fast: `${add(
        baseFee.gwei,
        speeds.fast.maxPriorityFeePerGas.gwei,
      )} - ${add(
        speeds.fast.maxBaseFee.gwei,
        speeds.fast.maxPriorityFeePerGas.gwei,
      )}`,
      urgent: `${add(
        baseFee.gwei,
        speeds.urgent.maxPriorityFeePerGas.gwei,
      )} - ${add(
        speeds.urgent.maxBaseFee.gwei,
        speeds.urgent.maxPriorityFeePerGas.gwei,
      )}`,
    };
    return speedss;
  }, [baseFee.gwei, speeds]);

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
