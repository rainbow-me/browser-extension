import React, { useState } from 'react';
import { Chain, chain } from 'wagmi';

import { useCurrentCurrencyStore } from '~/core/state';
import { GasSpeed } from '~/core/types/gas';
import {
  add,
  convertRawAmountToNativeDisplay,
  multiply,
} from '~/core/utils/numbers';
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
import { useNativeAssetForNetwork } from '../../hooks/useNativeAssetForNetwork';
import { ChainBadge } from '../ChainBadge/ChainBadge';

import { SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type TransactionFeeProps = {
  chainId: Chain['id'];
};

export function TransactionFee({ chainId }: TransactionFeeProps) {
  const { gasFeeParamsBySpeed } = useMeteorologyData({ chainId });
  const [speed, setSpeed] = useState<GasSpeed>('normal');
  const asset = useNativeAssetForNetwork({ chainId: 1 });
  const { currentCurrency } = useCurrentCurrencyStore();
  const gasLimit = 20000;

  const gas = add(
    gasFeeParamsBySpeed[speed].maxBaseFee.amount,
    gasFeeParamsBySpeed[speed].maxPriorityFeePerGas.amount,
  );

  const totalWei = multiply(gasLimit, gas);

  // getna
  const nativeDisplay = convertRawAmountToNativeDisplay(
    totalWei,
    18,
    asset?.price?.value || 0,
    currentCurrency,
  );

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
                {`${nativeDisplay.amount} ~ ${gasFeeParamsBySpeed[speed].estimatedTime.display}`}
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
            gasFeeParamsBySpeed={gasFeeParamsBySpeed}
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
