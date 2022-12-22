import { TransactionRequest } from '@ethersproject/abstract-provider';
import React from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
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

import { useGas } from '../../hooks/useGas';
import { ChainBadge } from '../ChainBadge/ChainBadge';

import { SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type TransactionFeeProps = {
  chainId: Chain['id'];
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
};

export function TransactionFee({
  chainId,
  defaultSpeed,
  transactionRequest,
}: TransactionFeeProps) {
  const { selectedSpeed, setSelectedSpeed, gasFeeParamsBySpeed, isLoading } =
    useGas({
      chainId,
      defaultSpeed,
      transactionRequest,
    });

  return (
    <Columns alignHorizontal="justify" alignVertical="center">
      <Column>
        <Rows space="8px">
          <Row>
            <Text weight="semibold" color="labelQuaternary" size="12pt">
              {i18n.t('transaction_fee.estimated_fee')}
            </Text>
          </Row>
          <Row>
            <Inline alignVertical="center" space="4px">
              <ChainBadge chainId={chainId} size="small" />
              <Text weight="semibold" color="label" size="14pt">
                {isLoading
                  ? '~'
                  : `${gasFeeParamsBySpeed[selectedSpeed].gasFee.display} ~ ${gasFeeParamsBySpeed[selectedSpeed].estimatedTime.display}`}
              </Text>
            </Inline>
          </Row>
        </Rows>
      </Column>
      <Column>
        <Inline space="6px" alignVertical="center" alignHorizontal="right">
          <SwitchTransactionSpeedMenu
            selectedSpeed={selectedSpeed}
            onSpeedChanged={setSelectedSpeed}
            chainId={chainId}
            gasFeeParamsBySpeed={gasFeeParamsBySpeed}
            editable={
              chainId === ChainId.mainnet || chainId === ChainId.polygon
            }
          />
          {chainId === ChainId.mainnet ? (
            <Box
              borderRadius="round"
              boxShadow="12px accent"
              borderWidth="2px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              borderColor="fillSecondary"
              style={{ height: 28, width: 28 }}
            >
              <Symbol weight="medium" symbol="slider.horizontal.3" size={12} />
            </Box>
          ) : null}
        </Inline>
      </Column>
    </Columns>
  );
}
