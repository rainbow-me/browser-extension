import { TransactionRequest } from '@ethersproject/abstract-provider';
import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { useDefaultTxSpeedStore } from '~/core/state/currentSettings/defaultTxSpeed';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  GasFeeLegacyParamsBySpeed,
  GasFeeParamsBySpeed,
  GasSpeed,
} from '~/core/types/gas';
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

import { useSwapGas, useTransactionGas } from '../../hooks/useGas';
import { ChainBadge } from '../ChainBadge/ChainBadge';

import { CustomGasSheet } from './CustomGasSheet';
import { SwitchTransactionSpeedMenu } from './TransactionSpeedsMenu';

type FeeProps = {
  chainId: ChainId;
  accentColor?: string;
  plainTriggerBorder?: boolean;
  selectedSpeed: GasSpeed;
  gasFeeParamsBySpeed: GasFeeParamsBySpeed | GasFeeLegacyParamsBySpeed | null;
  isLoading: boolean;
  currentBaseFee: string;
  baseFeeTrend: number;
  setSelectedSpeed: React.Dispatch<React.SetStateAction<GasSpeed>>;
  setCustomMaxBaseFee: (maxBaseFee?: string) => void;
  setCustomMaxPriorityFee: (maxPriorityFee?: string) => void;
  clearCustomGasModified: () => void;
};

function Fee({
  chainId,
  accentColor,
  plainTriggerBorder,
  selectedSpeed,
  setSelectedSpeed,
  gasFeeParamsBySpeed,
  isLoading,
  setCustomMaxBaseFee,
  setCustomMaxPriorityFee,
  currentBaseFee,
  baseFeeTrend,
  clearCustomGasModified,
}: FeeProps) {
  const [showCustomGasSheet, setShowCustomGasSheet] = useState(false);

  const gasFeeParamsForSelectedSpeed = useMemo(
    () => gasFeeParamsBySpeed?.[selectedSpeed],
    [gasFeeParamsBySpeed, selectedSpeed],
  );
  const openCustomGasSheet = useCallback(() => {
    setShowCustomGasSheet(true);
    analytics.track(event.dappPromptSendTransactionCustomGasClicked);
  }, []);

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
      analytics.track(event.dappPromptSendTransactionSpeedSwitched, { speed });
    },
    [openCustomGasSheet, setSelectedSpeed],
  );

  const onSpeedOpenChange = (isOpen: boolean) =>
    isOpen && analytics.track(event.dappPromptSendTransactionSpeedClicked);

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
              onOpenChange={onSpeedOpenChange}
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

type TransactionFeeProps = {
  chainId: ChainId;
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
  } = useTransactionGas({
    chainId,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    transactionRequest,
  });
  return (
    <Fee
      chainId={chainId}
      accentColor={accentColor}
      plainTriggerBorder={plainTriggerBorder}
      selectedSpeed={selectedSpeed}
      setSelectedSpeed={setSelectedSpeed}
      gasFeeParamsBySpeed={gasFeeParamsBySpeed}
      isLoading={isLoading}
      setCustomMaxBaseFee={setCustomMaxBaseFee}
      setCustomMaxPriorityFee={setCustomMaxPriorityFee}
      currentBaseFee={currentBaseFee}
      baseFeeTrend={baseFeeTrend}
      clearCustomGasModified={clearCustomGasModified}
    />
  );
}

type SwapFeeProps = {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  tradeDetails?: Quote | CrosschainQuote | QuoteError;
  accentColor?: string;
  plainTriggerBorder?: boolean;
  assetToSell?: ParsedSearchAsset;
};

export function SwapFee({
  chainId,
  defaultSpeed,
  tradeDetails,
  accentColor,
  plainTriggerBorder,
  assetToSell,
}: SwapFeeProps) {
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
  } = useSwapGas({
    chainId,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    tradeDetails,
    assetToSell,
  });
  return (
    <Fee
      chainId={chainId}
      accentColor={accentColor}
      plainTriggerBorder={plainTriggerBorder}
      selectedSpeed={selectedSpeed}
      setSelectedSpeed={setSelectedSpeed}
      gasFeeParamsBySpeed={gasFeeParamsBySpeed}
      isLoading={isLoading}
      setCustomMaxBaseFee={setCustomMaxBaseFee}
      setCustomMaxPriorityFee={setCustomMaxPriorityFee}
      currentBaseFee={currentBaseFee}
      baseFeeTrend={baseFeeTrend}
      clearCustomGasModified={clearCustomGasModified}
    />
  );
}
