/* eslint-disable no-nested-ternary */
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { EventProperties } from '~/analytics/event';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
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
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { Space } from '~/design-system/styles/designTokens';

import { useDefaultTxSpeed } from '../../hooks/useDefaultTxSpeed';
import {
  useApprovalGas,
  useSwapGas,
  useTransactionGas,
} from '../../hooks/useGas';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { ChainBadge } from '../ChainBadge/ChainBadge';
import { CursorTooltip } from '../Tooltip/CursorTooltip';

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
  const { trackShortcut } = useKeyboardAnalytics();
  const [showCustomGasSheet, setShowCustomGasSheet] = useState(false);
  const switchTransactionSpeedMenuRef = useRef<{ open: () => void }>(null);
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
      } else {
        setSelectedSpeed(speed);
      }
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

  const trackShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.OPEN_CUSTOM_GAS_MENU.key) {
        if (chainId === ChainId.mainnet) {
          trackShortcut({
            key: shortcuts.global.OPEN_CUSTOM_GAS_MENU.display,
            type: 'customGasMenu.open',
          });
          // hackery preventing GweiInputMask from firing an onChange event when opening the menu with KB
          setTimeout(() => openCustomGasSheet(), 0);
        }
      } else if (e.key === shortcuts.global.OPEN_GAS_MENU.key) {
        if (chainId === ChainId.mainnet || chainId === ChainId.polygon) {
          trackShortcut({
            key: shortcuts.global.OPEN_GAS_MENU.display,
            type: 'gasMenu.open',
          });
          switchTransactionSpeedMenuRef?.current?.open();
        }
      }
    },
    [chainId, openCustomGasSheet, trackShortcut],
  );

  useKeyboardShortcut({
    handler: trackShortcuts,
  });

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
              <Columns alignVertical="center" space="4px">
                <Column width="content">
                  <ChainBadge chainId={chainId} size="18" />
                </Column>
                <Column width="content">
                  <TextOverflow weight="semibold" color="label" size="14pt">
                    {isLoading
                      ? '~'
                      : `${
                          gasFeeParamsForSelectedSpeed?.gasFee.display || '~'
                        }`}
                  </TextOverflow>
                </Column>
                <Column>
                  <TextOverflow
                    weight="semibold"
                    color="labelTertiary"
                    size="14pt"
                  >
                    {isLoading
                      ? ''
                      : `${
                          gasFeeParamsForSelectedSpeed?.estimatedTime.display ||
                          ''
                        }`}
                  </TextOverflow>
                </Column>
              </Columns>
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
              ref={switchTransactionSpeedMenuRef}
            />
            {chainId === ChainId.mainnet ? (
              <CursorTooltip
                align="end"
                arrowAlignment="right"
                arrowCentered
                text={i18n.t('tooltip.gwei_settings')}
                textWeight="bold"
                textSize="12pt"
                textColor="labelSecondary"
                hint={shortcuts.global.OPEN_CUSTOM_GAS_MENU.display}
              >
                <Lens
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
                </Lens>
              </CursorTooltip>
            ) : null}
          </Inline>
        </Column>
      </Columns>
    </Box>
  );
}

type TransactionFeeProps = {
  chainId: ChainId;
  address?: Address;
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
  accentColor?: string;
  plainTriggerBorder?: boolean;
  flashbotsEnabled?: boolean;
  analyticsEvents?: {
    customGasClicked: keyof EventProperties;
    transactionSpeedSwitched: keyof EventProperties;
    transactionSpeedClicked: keyof EventProperties;
  };
};

export function TransactionFee({
  chainId,
  address,
  defaultSpeed,
  transactionRequest,
  accentColor,
  plainTriggerBorder,
  analyticsEvents,
  flashbotsEnabled,
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
    address,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    transactionRequest,
    flashbotsEnabled: !!flashbotsEnabled,
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
      flashbotsEnabled={!!flashbotsEnabled}
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
      flashbotsEnabled={!!flashbotsEnabled}
      speedMenuMarginRight={speedMenuMarginRight}
    />
  );
}

type ApprovalFeeProps = {
  chainId: ChainId;
  address: Address;
  assetAddress?: Address;
  spenderAddress?: Address;
  defaultSpeed?: GasSpeed;
  transactionRequest: TransactionRequest;
  accentColor?: string;
  plainTriggerBorder?: boolean;
  flashbotsEnabled?: boolean;
  analyticsEvents?: {
    customGasClicked: keyof EventProperties;
    transactionSpeedSwitched: keyof EventProperties;
    transactionSpeedClicked: keyof EventProperties;
  };
  assetType: 'erc20' | 'nft';
};

export function ApprovalFee({
  chainId,
  address,
  assetAddress,
  spenderAddress,
  defaultSpeed,
  transactionRequest,
  accentColor,
  plainTriggerBorder,
  analyticsEvents,
  flashbotsEnabled,
  assetType,
}: ApprovalFeeProps) {
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
  } = useApprovalGas({
    chainId,
    address,
    assetAddress,
    spenderAddress,
    defaultSpeed: defaultSpeed || defaultTxSpeed,
    transactionRequest,
    flashbotsEnabled: !!flashbotsEnabled,
    assetType,
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
      flashbotsEnabled={!!flashbotsEnabled}
    />
  );
}
