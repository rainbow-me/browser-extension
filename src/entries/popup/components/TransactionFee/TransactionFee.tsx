import React from 'react';
import { Chain } from 'wagmi';

import { useMeteorology } from '~/core/resources/meteorology';
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

type TransactionFeeProps = {
  chainId: Chain['id'];
};

export function TransactionFee({ chainId }: TransactionFeeProps) {
  const { data } = useMeteorology({ chainId });

  console.log('data', data);

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
          <Box
            borderWidth="2px"
            borderColor="fillSecondary"
            paddingVertical="5px"
            paddingHorizontal="6px"
            borderRadius="24px"
          >
            <Inline space="6px" alignVertical="center">
              <Text color="label" weight="bold" size="14pt">
                ⏱
              </Text>

              <Text color="label" weight="bold" size="14pt">
                Normal
              </Text>
              <Symbol
                weight="medium"
                color="label"
                size={14}
                symbol="chevron.down.circle"
              />
            </Inline>
          </Box>

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
