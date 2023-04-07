import { TransactionRequest } from '@ethersproject/abstract-provider';
import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React, { useCallback, useMemo, useState } from 'react';

import { analytics } from '~/analytics';
import { EventProperties } from '~/analytics/event';
import { i18n } from '~/core/languages';
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
import { Space } from '~/design-system/styles/designTokens';

import { useDefaultTxSpeed } from '../../hooks/useDefaultTxSpeed';
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
  flashbotsEnabled: boolean;
  analyticsEvents?: {
    customGasClicked: keyof EventProperties;
    transactionSpeedSwitched: keyof EventProperties;
    transactionSpeedClicked: keyof EventProperties;
  };
  speedMenuMarginRight?: Space;
  setSelectedSpeed: React.Dispatch<React.SetStateAction<GasSpeed>>;
  setCustomMaxBaseFee: (maxBaseFee?: string) => void;
  setCustomMaxPriorityFee: (maxPriorityFee?: string) => void;
};

function Fee({
  accentColor,
  analyticsEvents,
  baseFeeTrend,
  chainId,
  currentBaseFee,
  gasFeeParamsBySpeed,
  isLoading,
  plainTriggerBorder,
  selectedSpeed,
  flashbotsEnabled,
  speedMenuMarginRight,
  setSelectedSpeed,
  setCustomMaxBaseFee,
  setCustomMaxPriorityFee,
}: FeeProps) {
  const [showCustomGasSheet, setShowCustomGasSheet] = useState(false);

  const gasFeeParamsForSelectedSpeed = useMemo(
    () => gasFeeParamsBySpeed?.[selectedSpeed],
    [gasFeeParamsBySpeed, selectedSpeed],
  );
  const openCustomGasSheet = useCallback(() => {
    setShowCustomGasSheet(true);
    analyticsEvents?.customGasClicked &&
      analytics.track(analyticsEvents?.customGasClicked);
  }, [analyticsEvents?.customGasClicked]);

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
      analyticsEvents?.transactionSpeedSwitched &&
        analytics.track(analyticsEvents?.transactionSpeedSwitched, { speed });
    },
    [
      analyticsEvents?.transactionSpeedSwitched,
      openCustomGasSheet,
      setSelectedSpeed,
    ],
  );

  const onSpeedOpenChange = useCallback(
    (isOpen: boolean) => {
      isOpen &&
        analyticsEvents?.transactionSpeedClicked &&
        analytics.track(analyticsEvents?.transactionSpeedClicked);
    },
    [analyticsEvents?.transactionSpeedClicked],
  );

  return (
    <Box>
      <CustomGasSheet
        flashbotsEnabled={flashbotsEnabled}
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
              dropdownContentMarginRight={speedMenuMarginRight}
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
  analyticsEvents?: {
    customGasClicked: keyof EventProperties;
    transactionSpeedSwitched: keyof EventProperties;
    transactionSpeedClicked: keyof EventProperties;
  };
};

export function TransactionFee({
  chainId,
  defaultSpeed,
  transactionRequest,
  accentColor,
  plainTriggerBorder,
  analyticsEvents,
}: TransactionFeeProps) {
  const { defaultTxSpeed } = useDefaultTxSpeed({ chainId });
  const {
    selectedSpeed,
    setSelectedSpeed,
    gasFeeParamsBySpeed,
    isLoading,
    setCustomMaxBaseFee,
    setCustomMaxPriorityFee,
    currentBaseFee,
    baseFeeTrend,
  } = useTransactionGas({
    chainId,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    transactionRequest,
  });
  return (
    <Fee
      analyticsEvents={analyticsEvents}
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
      flashbotsEnabled={false}
    />
  );
}

type SwapFeeProps = {
  chainId: ChainId;
  defaultSpeed?: GasSpeed;
  quote?: Quote | CrosschainQuote | QuoteError;
  accentColor?: string;
  plainTriggerBorder?: boolean;
  assetToSell?: ParsedSearchAsset;
  assetToBuy?: ParsedSearchAsset;
  enabled?: boolean;
  flashbotsEnabled?: boolean;
  speedMenuMarginRight?: Space;
  quoteServiceTime?: number;
};

export function SwapFee({
  chainId,
  defaultSpeed,
  quote,
  accentColor,
  plainTriggerBorder,
  assetToSell,
  assetToBuy,
  enabled = true,
  flashbotsEnabled,
  speedMenuMarginRight,
  quoteServiceTime,
}: SwapFeeProps) {
  const { defaultTxSpeed } = useDefaultTxSpeed({ chainId });
  const {
    selectedSpeed,
    setSelectedSpeed,
    gasFeeParamsBySpeed,
    isLoading,
    setCustomMaxBaseFee,
    setCustomMaxPriorityFee,
    currentBaseFee,
    baseFeeTrend,
  } = useSwapGas({
    chainId,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    quote,
    assetToSell,
    assetToBuy,
    enabled,
    flashbotsEnabled,
    quoteServiceTime,
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
      flashbotsEnabled={false}
      speedMenuMarginRight={speedMenuMarginRight}
    />
  );
}
