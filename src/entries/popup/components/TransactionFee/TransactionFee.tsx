import { TransactionRequest } from '@ethersproject/abstract-provider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chain } from 'wagmi';

import { i18n } from '~/core/languages';
import { useDefaultTxSpeedStore } from '~/core/state/currentSettings/defaultTxSpeed';
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
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { useGas } from '../../hooks/useGas';
import { ChainBadge } from '../ChainBadge/ChainBadge';

import { CustomGasSheet } from './CustomGasSheet';
import { SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type TransactionFeeProps = {
  chainId: Chain['id'];
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
  accentColor?: string;
  plainTriggerBorder?: boolean;
};

export function TransactionFee({
  chainId,
  defaultSpeed,
  transactionRequest,
  accentColor,
  plainTriggerBorder,
}: TransactionFeeProps) {
  const [showCustomGasSheet, setShowCustomGasSheet] = useState(false);
  const { defaultTxSpeed } = useDefaultTxSpeedStore();
  const {
    selectedSpeed,
    setSelectedSpeed,
    gasFeeParamsBySpeed,
    isLoading,
    setCustomMaxBaseFee,
    setCustomMaxPriorityFee,
    currentBaseFee,
    baseFeeTrend,
    clearCustomGasModified,
  } = useGas({
    chainId,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    transactionRequest,
  });

  const gasFeeParamsForSelectedSpeed = useMemo(
    () => gasFeeParamsBySpeed?.[selectedSpeed],
    [gasFeeParamsBySpeed, selectedSpeed],
  );

  const openCustomGasSheet = useCallback(() => setShowCustomGasSheet(true), []);

  const closeCustomGasSheet = useCallback(
    () => setShowCustomGasSheet(false),
    [],
  );

  const onSpeedChanged = useCallback(
    (speed: GasSpeed) => {
      if (speed === GasSpeed.CUSTOM) {
        openCustomGasSheet();
      }
      setSelectedSpeed(speed);
    },
    [openCustomGasSheet, setSelectedSpeed],
  );

  useEffect(() => {
    clearCustomGasModified();
  }, [clearCustomGasModified]);

  return (
    <Box>
      <CustomGasSheet
        currentBaseFee={currentBaseFee}
        baseFeeTrend={baseFeeTrend}
        show={showCustomGasSheet}
        setCustomMaxBaseFee={setCustomMaxBaseFee}
        setCustomMaxPriorityFee={setCustomMaxPriorityFee}
        closeCustomGasSheet={closeCustomGasSheet}
        setSelectedSpeed={setSelectedSpeed}
      />
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
                <TextOverflow
                  maxWidth={75}
                  weight="semibold"
                  color="label"
                  size="14pt"
                >
                  {isLoading
                    ? '~'
                    : `${gasFeeParamsForSelectedSpeed?.gasFee.display}`}
                </TextOverflow>
                <Text weight="semibold" color="labelTertiary" size="14pt">
                  {isLoading
                    ? ''
                    : `${gasFeeParamsForSelectedSpeed?.estimatedTime.display}`}
                </Text>
              </Inline>
            </Row>
          </Rows>
        </Column>
        <Column>
          <Inline space="6px" alignVertical="center" alignHorizontal="right">
            <SwitchTransactionSpeedMenu
              selectedSpeed={selectedSpeed}
              onSpeedChanged={onSpeedChanged}
              chainId={chainId}
              gasFeeParamsBySpeed={gasFeeParamsBySpeed}
              editable={
                chainId === ChainId.mainnet || chainId === ChainId.polygon
              }
              accentColor={accentColor}
              plainTriggerBorder={plainTriggerBorder}
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
                onClick={openCustomGasSheet}
              >
                <Symbol
                  weight="medium"
                  symbol="slider.horizontal.3"
                  size={12}
                />
              </Box>
            ) : null}
          </Inline>
        </Column>
      </Columns>
    </Box>
  );
}
