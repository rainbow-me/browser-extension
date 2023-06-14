import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useGasStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedSearchAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { handleAssetAccentColor } from '~/core/utils/colors';
import { getQuoteServiceTime } from '~/core/utils/swaps';
import {
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Row,
  Rows,
  Stack,
  Symbol,
  Text,
  TextOverflow,
} from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { TextStyles } from '~/design-system/styles/core.css';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../components/ExplainerSheet/ExplainerSheet';
import { SWAP_INPUT_MASK_ID } from '../../components/InputMask/SwapInputMask/SwapInputMask';
import { Navbar } from '../../components/Navbar/Navbar';
import { SwapFee } from '../../components/TransactionFee/TransactionFee';
import {
  useSwapActions,
  useSwapAssets,
  useSwapDropdownDimensions,
  useSwapInputs,
  useSwapQuote,
  useSwapQuoteHandler,
  useSwapSettings,
  useSwapValidations,
} from '../../hooks/swap';
import { SwapTimeEstimate } from '../../hooks/swap/useSwapActions';
import {
  SwapPriceImpact,
  SwapPriceImpactType,
  useSwapPriceImpact,
} from '../../hooks/swap/useSwapPriceImpact';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { getActiveElement, getInputIsFocused } from '../../utils/activeElement';

import { SwapReviewSheet } from './SwapReviewSheet/SwapReviewSheet';
import { SwapSettings } from './SwapSettings/SwapSettings';
import { TokenToBuyInput } from './SwapTokenInput/TokenToBuyInput';
import { TokenToSellInput } from './SwapTokenInput/TokenToSellInput';

const SwapWarning = ({
  timeEstimate,
  priceImpact,
}: {
  timeEstimate?: SwapTimeEstimate | null;
  priceImpact?: SwapPriceImpact;
}) => {
  const showWarning = useMemo(() => {
    return (
      priceImpact?.type !== SwapPriceImpactType.none || timeEstimate?.isLongWait
    );
  }, [priceImpact?.type, timeEstimate?.isLongWait]);

  const { warningTitle, warningDescription, warningColor, warningType } =
    useMemo(() => {
      if (priceImpact?.type !== SwapPriceImpactType.none) {
        return {
          warningType: 'price-impact',
          warningTitle: i18n.t('swap.warnings.price_impact.title'),
          warningDescription: i18n.t('swap.warnings.price_impact.description', {
            impactAmount: priceImpact?.impactDisplay,
          }),
          warningColor: (priceImpact?.type === SwapPriceImpactType.high
            ? 'orange'
            : 'red') as TextStyles['color'],
        };
      } else if (timeEstimate?.isLongWait) {
        return {
          warningType: 'long-wait',
          warningTitle: i18n.t('swap.warnings.long_wait.title'),
          warningDescription: i18n.t('swap.warnings.long_wait.description', {
            time: timeEstimate?.timeEstimateDisplay,
          }),
          warningColor: 'orange' as TextStyles['color'],
        };
      } else {
        return {
          warningType: '',
          warningTitle: '',
          warningDescription: '',
          warningColor: 'orange' as TextStyles['color'],
        };
      }
    }, [
      priceImpact?.impactDisplay,
      priceImpact?.type,
      timeEstimate?.isLongWait,
      timeEstimate?.timeEstimateDisplay,
    ]);

  if (!showWarning) return null;
  return (
    <ButtonOverflow>
      <Box testId={`swap-warning-${warningType}`} paddingHorizontal="20px">
        <Box
          paddingVertical="10px"
          paddingHorizontal="12px"
          borderRadius="round"
          borderWidth="1px"
          borderColor="buttonStroke"
          background="surfacePrimaryElevatedSecondary"
        >
          <Inline space="8px" alignVertical="center" alignHorizontal="center">
            <Inline space="4px" alignVertical="center">
              <Symbol
                symbol="exclamationmark.triangle.fill"
                size={16}
                color={warningColor || 'orange'}
                weight="bold"
              />
              <Text color="label" size="14pt" weight="bold">
                {warningTitle}
              </Text>
            </Inline>
            <Box
              background="fillSecondary"
              style={{ width: '14px', height: '2px' }}
            />
            <TextOverflow color={warningColor} size="14pt" weight="semibold">
              {warningDescription}
            </TextOverflow>
          </Inline>
        </Box>
      </Box>
    </ButtonOverflow>
  );
};

export function Swap() {
  const [showSwapSettings, setShowSwapSettings] = useState(false);
  const [showSwapReview, setShowSwapReview] = useState(false);
  const [inReviewSheet, setInReviewSheet] = useState(false);
  const [inputToOpenOnMount, setInputToOpenOnMount] = useState<
    'sell' | 'buy' | null
  >(null);

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();
  const { selectedGas, clearCustomGasModified } = useGasStore();

  const { selectedToken, setSelectedToken } = useSelectedTokenStore();
  const { currentTheme } = useCurrentThemeStore();

  const showSwapReviewSheet = useCallback(() => {
    setShowSwapReview(true);
    setInReviewSheet(true);
  }, []);

  const hideSwapReviewSheet = useCallback(() => {
    setShowSwapReview(false);
    // to give time for the review sheet to hide after we re enable
    // gas fee calculations on this component
    setTimeout(() => {
      setInReviewSheet(false);
    }, 1000);
  }, []);

  const {
    assetsToSell,
    assetToSellFilter,
    assetsToBuy,
    assetToBuyFilter,
    sortMethod,
    assetToBuy,
    assetToSell,
    outputChainId,
    setSortMethod,
    setOutputChainId,
    setAssetToSell,
    setAssetToBuy,
    setAssetToSellFilter,
    setAssetToBuyFilter,
  } = useSwapAssets();

  const { toSellInputHeight, toBuyInputHeight } = useSwapDropdownDimensions({
    assetToSell,
    assetToBuy,
  });

  const { source, slippage, setSettings, swapFlashbotsEnabled } =
    useSwapSettings({
      chainId: assetToSell?.chainId || ChainId.mainnet,
    });

  const flashbotsEnabledGlobally =
    config.flashbots_enabled &&
    swapFlashbotsEnabled &&
    assetToSell?.chainId === ChainId.mainnet;

  const {
    assetToSellInputRef,
    assetToBuyInputRef,
    assetToSellMaxValue,
    assetToBuyValue,
    assetToSellValue,
    assetToSellDisplay,
    assetToSellDropdownClosed,
    assetToBuyDropdownClosed,
    independentField,
    flipAssets,
    onAssetToSellInputOpen,
    onAssetToBuyInputOpen,
    setAssetToSellMaxValue,
    setAssetToSellValue,
    setAssetToSellInputValue,
    setAssetToBuyValue,
    setAssetToBuyInputValue,
  } = useSwapInputs({
    assetToSell,
    assetToBuy,
    selectedGas,
    setAssetToSell,
    setAssetToBuy,
  });

  const {
    data: quote,
    isLoading,
    isCrosschainSwap,
    isWrapOrUnwrapEth,
  } = useSwapQuote({
    assetToSell,
    assetToBuy,
    assetToSellValue,
    assetToBuyValue,
    independentField,
    source,
    slippage,
  });

  const { priceImpact } = useSwapPriceImpact({
    assetToBuy,
    assetToSell,
    isWrapOrUnwrapEth,
    quote: (quote as QuoteError)?.error
      ? undefined
      : (quote as Quote | CrosschainQuote),
  });

  const { buttonLabel: validationButtonLabel, enoughAssetsForSwap } =
    useSwapValidations({
      assetToSell,
      assetToSellValue,
      selectedGas,
    });

  const {
    buttonLabel,
    buttonLabelColor,
    buttonDisabled,
    buttonIcon,
    buttonColor,
    timeEstimate,
    buttonAction,
    status,
  } = useSwapActions({
    quote,
    isLoading,
    assetToSell,
    assetToBuy,
    enoughAssetsForSwap,
    validationButtonLabel,
    showExplainerSheet,
    hideExplainerSheet,
    showSwapReviewSheet,
  });

  useSwapQuoteHandler({
    assetToBuy,
    assetToSell,
    quote,
    independentField,
    setAssetToBuyValue,
    setAssetToSellValue,
  });

  const openSettings = useCallback(() => {
    setShowSwapSettings(true);
    onAssetToSellInputOpen(false);
    onAssetToBuyInputOpen(false);
  }, [onAssetToBuyInputOpen, onAssetToSellInputOpen]);

  const selectAssetToSell = useCallback(
    (asset: ParsedSearchAsset | null) => {
      setAssetToSell(asset);
      setAssetToSellInputValue('');
      setAssetToBuyInputValue('');
    },
    [setAssetToBuyInputValue, setAssetToSell, setAssetToSellInputValue],
  );

  useEffect(() => {
    // navigating from token row
    if (selectedToken) {
      const selectedTokenId = selectedToken?.uniqueId;
      const selectedSearchAsset = assetsToSell.find(
        (asset) => asset?.uniqueId === selectedTokenId,
      );
      if (selectedSearchAsset) {
        selectAssetToSell(selectedSearchAsset);
        // clear selected token
        setSelectedToken();
      }
      setInputToOpenOnMount('buy');
    } else {
      setInputToOpenOnMount('sell');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      clearCustomGasModified();
    };
  }, [clearCustomGasModified]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.swap.FLIP_ASSETS.key) {
        const flippingAfterSearch =
          getInputIsFocused() && getActiveElement()?.id === SWAP_INPUT_MASK_ID;
        if (flippingAfterSearch || !getInputIsFocused()) {
          e.preventDefault();
          flipAssets();
        }
      }
      if (e.key === shortcuts.swap.SET_MAX_AMOUNT.key) {
        if (assetToSell) {
          const maxxingAfterSearch =
            getInputIsFocused() &&
            getActiveElement()?.id === SWAP_INPUT_MASK_ID;
          if (maxxingAfterSearch || !getInputIsFocused()) {
            e.preventDefault();
            setAssetToSellMaxValue();
          }
        }
      }
    },
  });

  const assetToBuyAccentColor = useMemo(
    () =>
      handleAssetAccentColor(
        currentTheme,
        assetToBuy?.colors?.primary || assetToBuy?.colors?.fallback,
      ),
    [assetToBuy?.colors?.fallback, assetToBuy?.colors?.primary, currentTheme],
  );

  return (
    <>
      <Navbar
        title={i18n.t('swap.title')}
        background={'surfaceSecondary'}
        leftComponent={<Navbar.CloseButton />}
        rightComponent={
          <ButtonSymbol
            color="surfaceSecondaryElevated"
            height={'32px'}
            onClick={openSettings}
            symbol="switch.2"
            symbolColor="labelSecondary"
            variant="flat"
            testId="swap-settings-navbar-button"
          />
        }
      />
      <SwapReviewSheet
        show={showSwapReview}
        assetToBuy={assetToBuy}
        assetToSell={assetToSell}
        quote={quote}
        flashbotsEnabled={flashbotsEnabledGlobally}
        hideSwapReview={hideSwapReviewSheet}
        assetToSellValue={assetToSellDisplay}
      />
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
        linkButton={explainerSheetParams.linkButton}
        testId={explainerSheetParams.testId}
      />
      <SwapSettings
        show={showSwapSettings}
        onDone={() => setShowSwapSettings(false)}
        accentColor={assetToBuyAccentColor}
        setSettings={setSettings}
        slippage={slippage}
        chainId={assetToSell?.chainId}
      />
      <Box
        background="surfaceSecondary"
        style={{ height: 535 }}
        paddingBottom="20px"
        paddingHorizontal="12px"
      >
        <Rows alignVertical="justify">
          <Row height="content">
            <Stack space="8px">
              <AccentColorProviderWrapper
                color={handleAssetAccentColor(
                  currentTheme,
                  assetToSell?.colors?.primary || assetToSell?.colors?.fallback,
                )}
              >
                <TokenToSellInput
                  dropdownHeight={toSellInputHeight}
                  asset={assetToSell}
                  assets={assetsToSell}
                  selectAsset={selectAssetToSell}
                  onDropdownOpen={onAssetToSellInputOpen}
                  dropdownClosed={assetToSellDropdownClosed}
                  setSortMethod={setSortMethod}
                  assetFilter={assetToSellFilter}
                  setAssetFilter={setAssetToSellFilter}
                  sortMethod={sortMethod}
                  zIndex={2}
                  placeholder={i18n.t('swap.input_token_to_swap_placeholder')}
                  assetToSellMaxValue={assetToSellMaxValue}
                  setAssetToSellMaxValue={setAssetToSellMaxValue}
                  assetToSellValue={assetToSellValue}
                  setAssetToSellInputValue={setAssetToSellInputValue}
                  inputRef={assetToSellInputRef}
                  openDropdownOnMount={inputToOpenOnMount === 'sell'}
                />
              </AccentColorProviderWrapper>

              <Box
                marginVertical="-20px"
                style={{ zIndex: assetToSellDropdownClosed ? 3 : 1 }}
              >
                <Inline alignHorizontal="center">
                  <ButtonOverflow testId="swap-flip-button">
                    <Box
                      boxShadow="12px surfaceSecondaryElevated"
                      background="surfaceSecondaryElevated"
                      borderRadius="32px"
                      borderWidth={'1px'}
                      borderColor="buttonStroke"
                      style={{ width: 42, height: 32, zIndex: 10 }}
                      onClick={flipAssets}
                    >
                      <Box width="full" height="full" alignItems="center">
                        <Inline
                          height="full"
                          alignHorizontal="center"
                          alignVertical="center"
                        >
                          <Stack alignHorizontal="center">
                            <Box marginBottom="-4px">
                              <ChevronDown color="labelTertiary" />
                            </Box>
                            <Box marginTop="-4px">
                              <ChevronDown color="labelQuaternary" />
                            </Box>
                          </Stack>
                        </Inline>
                      </Box>
                    </Box>
                  </ButtonOverflow>
                </Inline>
              </Box>

              <AccentColorProviderWrapper color={assetToBuyAccentColor}>
                <TokenToBuyInput
                  dropdownHeight={toBuyInputHeight}
                  assetToBuy={assetToBuy}
                  assetToSell={assetToSell}
                  assets={assetsToBuy}
                  selectAsset={setAssetToBuy}
                  onDropdownOpen={onAssetToBuyInputOpen}
                  dropdownClosed={assetToBuyDropdownClosed}
                  zIndex={1}
                  placeholder={i18n.t(
                    'swap.input_token_to_receive_placeholder',
                  )}
                  setOutputChainId={setOutputChainId}
                  outputChainId={outputChainId}
                  assetFilter={assetToBuyFilter}
                  setAssetFilter={setAssetToBuyFilter}
                  assetToBuyValue={assetToBuyValue}
                  assetToSellValue={assetToSellValue}
                  setAssetToBuyInputValue={setAssetToBuyInputValue}
                  inputRef={assetToBuyInputRef}
                  openDropdownOnMount={inputToOpenOnMount === 'buy'}
                  inputDisabled={isCrosschainSwap}
                />
              </AccentColorProviderWrapper>
              <SwapWarning
                timeEstimate={timeEstimate}
                priceImpact={priceImpact}
              />
            </Stack>
          </Row>
          <Row height="content">
            {!!assetToBuy && !!assetToSell ? (
              <AccentColorProviderWrapper color={assetToBuyAccentColor}>
                <Box paddingHorizontal="8px">
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
                        enabled={!inReviewSheet}
                        defaultSpeed={selectedGas.option}
                        flashbotsEnabled={flashbotsEnabledGlobally}
                        quoteServiceTime={getQuoteServiceTime({
                          quote: quote as CrosschainQuote,
                        })}
                      />
                    </Row>
                    <Row>
                      <Button
                        onClick={buttonAction}
                        height="44px"
                        variant="flat"
                        color={buttonColor}
                        width="full"
                        testId="swap-review-button"
                        disabled={buttonDisabled}
                        tabIndex={0}
                      >
                        <Inline space="8px" alignVertical="center">
                          {buttonIcon}
                          <Text
                            testId={`swap-confirmation-button-${status}`}
                            color={buttonLabelColor}
                            size="16pt"
                            weight="bold"
                          >
                            {buttonLabel}
                          </Text>
                        </Inline>
                      </Button>
                    </Row>
                  </Rows>
                </Box>
              </AccentColorProviderWrapper>
            ) : (
              <Box paddingHorizontal="8px">
                <Button
                  height="44px"
                  variant="flat"
                  color="surfaceSecondary"
                  width="full"
                  disabled
                >
                  <Text color="labelQuaternary" size="14pt" weight="bold">
                    {i18n.t('swap.select_tokens_to_swap')}
                  </Text>
                </Button>
              </Box>
            )}
          </Row>
        </Rows>
      </Box>
    </>
  );
}
