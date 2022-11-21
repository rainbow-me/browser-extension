import React, { useState } from 'react';
import { Chain, chain } from 'wagmi';

import { GasSpeed } from '~/core/types/gas';
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

import { useMeteorologyData } from '../../hooks/useMeteorologyData';
import { ChainBadge } from '../ChainBadge/ChainBadge';

import { SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type TransactionFeeProps = {
  chainId: Chain['id'];
};

export function TransactionFee({ chainId }: TransactionFeeProps) {
  const { speeds } = useMeteorologyData({ chainId });
  const [speed, setSpeed] = useState<GasSpeed>('normal');

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
            speedGasLimits={speeds}
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
