import {
  CrosschainQuote,
  Quote,
  QuoteError,
  SwapType,
} from '@rainbow-me/swaps';
import { motion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'viem';

import { i18n } from '~/core/languages';
import { useGasStore } from '~/core/state';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { KeychainType } from '~/core/types/keychainTypes';
import { truncateAddress } from '~/core/utils/address';
import { processExchangeRateArray } from '~/core/utils/numbers';
import {
  Bleed,
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { ChevronDown } from '~/entries/popup/components/ChevronDown/ChevronDown';
import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '~/entries/popup/components/ExplainerSheet/ExplainerSheet';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { Spinner } from '~/entries/popup/components/Spinner/Spinner';
import { SwapFee } from '~/entries/popup/components/TransactionFee/TransactionFee';
import {
  useSwapReviewDetails,
  useSwapValidations,
} from '~/entries/popup/hooks/swap';
import { useCurrentWalletTypeAndVendor } from '~/entries/popup/hooks/useCurrentWalletType';
import { getNetworkNativeAssetUniqueId } from '~/entries/popup/hooks/useNativeAssetForNetwork';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useTranslationContext } from '~/entries/popup/hooks/useTranslationContext';
import { useUserAsset } from '~/entries/popup/hooks/useUserAsset';
import { ROUTES } from '~/entries/popup/urls';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { onSwap } from '../onSwap';

import { SwapAssetCard } from './SwapAssetCard';
import { SwapRoutes } from './SwapRoutes';
import { SwapViewContractDropdown } from './SwapViewContractDropdown';

export const ReviewDetailsRow = ({
  children,
  testId,
}: {
  children: React.ReactNode;
  testId: string;
}) => {
  return (
    <Box testId={`${testId}-details-row`} style={{ height: '32px' }}>
      <Inline height="full" alignVertical="center" alignHorizontal="justify">
        {children}
      </Inline>
    </Box>
  );
};

const CarrouselButton = ({
  textArray,
  symbol,
  testId,
}: {
  textArray: string[];
  symbol?: SymbolProps['symbol'];
  testId: string;
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const goToNextText = useCallback(() => {
    setCurrentTextIndex((currentTextIndex) =>
      currentTextIndex + 1 < textArray.length ? currentTextIndex + 1 : 0,
    );
  }, [textArray.length]);

  return (
    <ButtonOverflow>
      <Box testId={`${testId}-carrousel-button`} onClick={goToNextText}>
        <Inline space="4px" alignHorizontal="center" alignVertical="center">
          <Text size="14pt" weight="semibold" color="label">
            {textArray[currentTextIndex]}
          </Text>
          {symbol && (
            <Symbol
              symbol={symbol}
              weight="semibold"
              color="labelQuaternary"
              size={12}
            />
          )}
        </Inline>
      </Box>
    </ButtonOverflow>
  );
};

const Label = ({
  label,
  testId,
  infoButton = false,
  onClick = () => null,
}: {
  label: string;
  testId: string;
  infoButton?: boolean;
  onClick?: () => void;
}) => (
  <Box>
    <Stack space="8px">
      <Inline space="4px" alignVertical="center">
        <Box>
          <Text
            align="left"
            color="labelSecondary"
            size="14pt"
            weight="semibold"
          >
            {label}
          </Text>
        </Box>
        {infoButton && (
          <Box key="swap-settings-warning-icon">
            <Bleed vertical="6px" horizontal="6px">
              <ButtonSymbol
                symbol="info.circle.fill"
                color="labelQuaternary"
                height="28px"
                variant="tinted"
                onClick={onClick}
                testId={testId}
              />
            </Bleed>
          </Box>
        )}
      </Inline>
    </Stack>
  </Box>
);

export type SwapReviewSheetProps = {
  show: boolean;
  assetToSell?: ParsedSearchAsset | null;
  assetToSellValue?: string;
  assetToBuy?: ParsedSearchAsset | null;
  quote?: Quote | CrosschainQuote | QuoteError;
  hideSwapReview: () => void;
};

export const SwapReviewSheet = ({
  show,
  assetToSell,
  assetToSellValue,
  assetToBuy,
  quote,
  hideSwapReview,
}: SwapReviewSheetProps) => {
  if (!quote || !assetToBuy || !assetToSell || (quote as QuoteError)?.error)
    return null;
  return (
    <SwapReviewSheetWithQuote
      show={show}
      assetToSell={assetToSell}
      assetToSellValue={assetToSellValue}
      assetToBuy={assetToBuy}
      quote={quote as Quote | CrosschainQuote}
      hideSwapReview={hideSwapReview}
    />
  );
};

type SwapReviewSheetWithQuoteProps = {
  show: boolean;
  assetToSell: ParsedSearchAsset;
  assetToSellValue?: string;
  assetToBuy: ParsedSearchAsset;
  quote: Quote | CrosschainQuote;
  hideSwapReview: () => void;
};

const SwapReviewSheetWithQuote = ({
  show,
  assetToSell,
  assetToSellValue,
  assetToBuy,
  quote,
  hideSwapReview,
}: SwapReviewSheetWithQuoteProps) => {
  const navigate = useRainbowNavigate();

  const [showMoreDetails, setShowDetails] = useState(false);
  const [sendingSwap, setSendingSwap] = useState(false);
  const selectedGas = useGasStore((state) => state.selectedGas);
  const confirmSwapButtonRef = useRef<HTMLButtonElement>(null);
  const { type } = useCurrentWalletTypeAndVendor();
  const isHardwareWallet = type === KeychainType.HardwareWalletKeychain;

  const nativeAssetUniqueId = getNetworkNativeAssetUniqueId({
    chainId: assetToSell?.chainId,
  });
  const { data: nativeAsset } = useUserAsset(nativeAssetUniqueId || '');

  const { buttonLabel: validationButtonLabel, enoughNativeAssetBalanceForGas } =
    useSwapValidations({
      assetToSell,
      assetToSellValue,
      selectedGas,
    });

  const { minimumReceived, swappingRoute, includedFee, exchangeRate } =
    useSwapReviewDetails({ quote, assetToBuy, assetToSell });

  const formattedExchangeRate = useMemo(
    () => processExchangeRateArray(exchangeRate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exchangeRate],
  );

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();

  // translate based on the context, bridge or swap
  const t = useTranslationContext();

  const isWrapOrUnwrapEth = useMemo(() => {
    return (
      quote.swapType === SwapType.wrap || quote.swapType === SwapType.unwrap
    );
  }, [quote]);

  const openMoreDetails = useCallback(() => setShowDetails(true), []);
  const closeMoreDetails = useCallback(() => setShowDetails(false), []);

  const handleSwap = useCallback(async () => {
    if (!enoughNativeAssetBalanceForGas) {
      alert(
        i18n.t('send.button_label.insufficient_native_asset_for_gas', {
          symbol: nativeAsset?.symbol,
        }),
      );
      return;
    }

    setSendingSwap(true);
    const swapExecutedSuccessfully = await onSwap({
      assetToSell,
      assetToBuy,
      quote,
      degenMode: false,
    });
    setSendingSwap(false);

    if (swapExecutedSuccessfully) {
      navigate(ROUTES.HOME, { state: { tab: 'tokens' } });
    }
  }, [
    assetToBuy,
    assetToSell,
    enoughNativeAssetBalanceForGas,
    nativeAsset?.symbol,
    navigate,
    quote,
  ]);

  const goBack = useCallback(() => {
    hideSwapReview();
    closeMoreDetails();
  }, [closeMoreDetails, hideSwapReview]);

  const openFeeExplainer = useCallback(() => {
    showExplainerSheet({
      show: true,
      header: { emoji: '🌈' },
      title: t('swap.explainers.fee.title'),
      description: [
        t('swap.explainers.fee.description', {
          feePercentage: includedFee[1],
        }),
      ],
      actionButton: {
        label: t('swap.explainers.fee.action_label'),
        variant: 'tinted',
        labelColor: 'blue',
        action: hideExplainerSheet,
      },
      testId: 'swap-review-fee',
    });
  }, [hideExplainerSheet, includedFee, showExplainerSheet, t]);

  const buttonLabel = useMemo(() => {
    if (!enoughNativeAssetBalanceForGas) {
      return validationButtonLabel;
    }
    if (sendingSwap) {
      if (isHardwareWallet) return t('swap.actions.waiting_signature');
      return t('swap.actions.swapping');
    }

    return t('swap.review.confirmation', {
      sellSymbol: assetToSell.symbol,
      buySymbol: assetToBuy.symbol,
    });
  }, [
    assetToBuy.symbol,
    assetToSell.symbol,
    enoughNativeAssetBalanceForGas,
    validationButtonLabel,
    t,
    sendingSwap,
    isHardwareWallet,
  ]);

  const buttonColor = useMemo(
    () => (enoughNativeAssetBalanceForGas ? 'accent' : 'fillSecondary'),
    [enoughNativeAssetBalanceForGas],
  );

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        confirmSwapButtonRef.current?.focus();
      }, 301);
    }
  }, [show]);

  return (
    <>
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
        linkButton={explainerSheetParams.linkButton}
        testId={explainerSheetParams.testId}
      />
      <BottomSheet show={show}>
        <Box
          background="surfacePrimaryElevatedSecondary"
          style={{
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          }}
          isModal
        >
          <Stack space="12px">
            <Navbar
              title={t(`swap.review.title`)}
              titleTestId="swap-review-title-text"
              leftComponent={
                <Navbar.CloseButton testId="swap-review" onClick={goBack} />
              }
            />

            <Box>
              <Inline
                space="10px"
                alignVertical="center"
                alignHorizontal="center"
              >
                <SwapAssetCard
                  testId={`${assetToSell.symbol}-asset-to-sell`}
                  asset={assetToSell}
                  assetAmount={quote.sellAmount?.toString()}
                />
                <Box
                  boxShadow="12px surfaceSecondaryElevated"
                  background="surfaceSecondaryElevated"
                  borderRadius="32px"
                  borderWidth={'1px'}
                  borderColor="buttonStroke"
                  style={{
                    width: 32,
                    height: 32,
                    zIndex: zIndexes.CUSTOM_GAS_SHEET - 1,
                    position: 'absolute',
                    left: '0 auto',
                  }}
                >
                  <Inline
                    height="full"
                    alignHorizontal="center"
                    alignVertical="center"
                  >
                    <Inline alignHorizontal="center">
                      <Box style={{ rotate: '-90deg' }} marginRight="-6px">
                        <ChevronDown color="labelTertiary" />
                      </Box>
                      <Box style={{ rotate: '-90deg' }} marginLeft="-6px">
                        <ChevronDown color="labelQuaternary" />
                      </Box>
                    </Inline>
                  </Inline>
                </Box>

                <SwapAssetCard
                  testId={`${assetToBuy.symbol}-asset-to-buy`}
                  asset={assetToBuy}
                  assetAmount={quote.buyAmount?.toString()}
                />
              </Inline>
            </Box>
            <Box
              paddingHorizontal="20px"
              style={{ overflow: 'scroll', maxHeight: 211 }}
              paddingBottom="20px"
            >
              <Stack space="4px">
                <ReviewDetailsRow testId="minimum-received">
                  <Label
                    label={t('swap.review.minimum_received')}
                    testId="swap-review-swapping-route"
                  />
                  <Text size="14pt" weight="semibold" color="label">
                    {minimumReceived}
                  </Text>
                </ReviewDetailsRow>
                {!isWrapOrUnwrapEth && (
                  <ReviewDetailsRow testId="swapping-via">
                    <Label
                      label={t('swap.review.via')}
                      testId="swap-review-swapping-route"
                    />
                    {!!swappingRoute && (
                      <SwapRoutes
                        testId="swapping-via"
                        protocols={swappingRoute}
                      />
                    )}
                  </ReviewDetailsRow>
                )}
                <ReviewDetailsRow testId="included-fee">
                  <Label
                    label={t('swap.review.included_fee')}
                    testId="swap-review-rnbw-fee-info-button"
                    infoButton
                    onClick={openFeeExplainer}
                  />
                  <CarrouselButton
                    testId="included-fee"
                    textArray={includedFee}
                  />
                </ReviewDetailsRow>

                <Box as={motion.div} key="more-details" layout>
                  {showMoreDetails && (
                    <Box
                      as={motion.div}
                      key="more-details-shown"
                      testId="more-details-section"
                      layout
                    >
                      <ReviewDetailsRow testId="exchange-rate">
                        <Label
                          label={t('swap.review.exchange_rate')}
                          testId="swap-review-exchange-rate"
                        />
                        <CarrouselButton
                          testId="exchange-rate"
                          symbol="arrow.2.squarepath"
                          textArray={formattedExchangeRate}
                        />
                      </ReviewDetailsRow>
                      {!assetToSell.isNativeAsset && (
                        <ReviewDetailsRow testId="asset-to-sell-contract">
                          <Label
                            label={t('swap.review.asset_contract', {
                              symbol: assetToSell.symbol,
                            })}
                            testId="swap-review-asset-to-sell-contract"
                          />

                          <SwapViewContractDropdown
                            testId="asset-to-sell"
                            address={assetToSell.address as Address}
                            chainId={assetToSell.chainId}
                          >
                            <Text size="14pt" weight="semibold" color="label">
                              {truncateAddress(assetToSell.address)}
                            </Text>
                          </SwapViewContractDropdown>
                        </ReviewDetailsRow>
                      )}
                      {!assetToBuy.isNativeAsset && (
                        <ReviewDetailsRow testId="asset-to-buy-contract">
                          <Label
                            label={t('swap.review.asset_contract', {
                              symbol: assetToBuy.symbol,
                            })}
                            testId="swap-review-asset-to-buy-contract"
                          />
                          <SwapViewContractDropdown
                            testId="asset-to-buy"
                            address={assetToBuy.address as Address}
                            chainId={assetToBuy.chainId}
                          >
                            <Text size="14pt" weight="semibold" color="label">
                              {truncateAddress(assetToBuy.address)}
                            </Text>
                          </SwapViewContractDropdown>
                        </ReviewDetailsRow>
                      )}
                    </Box>
                  )}
                  {!showMoreDetails && (
                    <Box as={motion.div} key="more-details-hidden" layout>
                      <ReviewDetailsRow testId="more-details-hidden">
                        <Label
                          label={t('swap.review.more_details')}
                          testId="swap-review-details"
                        />
                        <ButtonSymbol
                          symbol="chevron.down.circle"
                          symbolSize={12}
                          color="labelQuaternary"
                          height="24px"
                          variant="tinted"
                          onClick={openMoreDetails}
                          testId="swap-review-more-details-button"
                        />
                      </ReviewDetailsRow>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
        <Separator strokeWeight="1px" color="separatorSecondary" />
        <Box padding="20px">
          <AccentColorProvider
            color={assetToBuy.colors?.primary || assetToBuy.colors?.fallback}
          >
            <Box>
              <Rows space="20px">
                <Row>
                  <SwapFee
                    chainId={assetToSell?.chainId || ChainId.mainnet}
                    quote={quote}
                    accentColor={
                      assetToBuy?.colors?.primary ||
                      assetToBuy?.colors?.fallback
                    }
                    assetToSell={assetToSell}
                    assetToBuy={assetToBuy}
                    enabled={show}
                    defaultSpeed={selectedGas.option}
                    speedMenuMarginRight="12px"
                  />
                </Row>
                <Row>
                  <Button
                    onClick={handleSwap}
                    height="44px"
                    variant="flat"
                    color={buttonColor}
                    disabled={sendingSwap}
                    width="full"
                    testId="swap-review-execute"
                    tabIndex={0}
                    ref={confirmSwapButtonRef}
                  >
                    {sendingSwap && (
                      <Box
                        width="fit"
                        alignItems="center"
                        justifyContent="center"
                        style={{ margin: 'auto' }}
                      >
                        <Spinner size={16} color="label" />
                      </Box>
                    )}
                    <Text
                      testId="swap-review-confirmation-text"
                      color="label"
                      size="16pt"
                      weight="bold"
                    >
                      {buttonLabel}
                    </Text>
                  </Button>
                </Row>
              </Rows>
            </Box>
          </AccentColorProvider>
        </Box>
      </BottomSheet>
    </>
  );
};
