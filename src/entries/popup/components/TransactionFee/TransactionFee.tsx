import React from 'react';
import { Chain, chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { SupportedCurrencyKey, supportedCurrencies } from '~/core/references';
import {
  convertRawAmountToBalance,
  handleSignificantDecimals,
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

import { useGas } from '../../hooks/useGas';
import { useNativeAssetForNetwork } from '../../hooks/useNativeAssetForNetwork';
import { ChainBadge } from '../ChainBadge/ChainBadge';

import { SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type TransactionFeeProps = {
  chainId: Chain['id'];
};

export function TransactionFee({ chainId }: TransactionFeeProps) {
  const {
    selectedSpeed,
    setSelectedSpeed,
    gasFeeParamsBySpeed,
    gasFee,
    isLoading,
  } = useGas({
    chainId,
  });
  const asset = useNativeAssetForNetwork({ chainId });

  // TODO estimate tx gas limit
  const gasLimit = 2000000;
  const totalWei = multiply(gasLimit, gasFee);
  const nativeBalance = convertRawAmountToBalance(
    totalWei,
    supportedCurrencies[asset?.symbol as SupportedCurrencyKey],
  ).amount;
  const displayFeeValue = handleSignificantDecimals(nativeBalance, 4);

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
                  : `${displayFeeValue} ~ ${gasFeeParamsBySpeed[selectedSpeed].estimatedTime.display}`}
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
              chainId === chain.mainnet.id || chainId === chain.polygon.id
            }
          />
          {chainId === chain.mainnet.id ? (
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
          ) : null}
        </Inline>
      </Column>
    </Columns>
  );
}
