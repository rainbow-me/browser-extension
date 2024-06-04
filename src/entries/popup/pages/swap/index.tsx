import { CrosschainQuote, Quote, QuoteError } from '@rainbow-me/swaps';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Address } from 'viem';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore, useGasStore } from '~/core/state';
import {
  computeUniqueIdForHiddenAsset,
  useHiddenAssetStore,
} from '~/core/state/hiddenAssets/hiddenAssets';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ParsedSearchAsset, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SearchAsset } from '~/core/types/search';
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
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { Lens } from '~/design-system/components/Lens/Lens';
import { TextStyles } from '~/design-system/styles/core.css';

import { ChevronDown } from '../../components/ChevronDown/ChevronDown';
import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../components/ExplainerSheet/ExplainerSheet';
import { SWAP_INPUT_MASK_ID } from '../../components/InputMask/SwapInputMask/SwapInputMask';
import { Navbar } from '../../components/Navbar/Navbar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { SwapFee } from '../../components/TransactionFee/TransactionFee';
import {
  useSwapAssets,
  useSwapDropdownDimensions,
  useSwapInputs,
  useSwapQuote,
  useSwapQuoteHandler,
  useSwapSettings,
  useSwapSlippage,
  useSwapValidations,
} from '../../hooks/swap';
import { useSwapNativeAmounts } from '../../hooks/swap/useSwapNativeAmounts';
import {
  SwapPriceImpact,
  SwapPriceImpactType,
  useSwapPriceImpact,
} from '../../hooks/swap/useSwapPriceImpact';
import { useBrowser } from '../../hooks/useBrowser';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import {
  TranslationContext,
  useTranslationContext,
} from '../../hooks/useTranslationContext';
import { getActiveElement, getInputIsFocused } from '../../utils/activeElement';

import { SwapReviewSheet } from './SwapReviewSheet/SwapReviewSheet';
import { SwapSettings } from './SwapSettings/SwapSettings';
import { TokenInputRef } from './SwapTokenInput/TokenInput';
import { TokenToBuyInput } from './SwapTokenInput/TokenToBuyInput';
import { TokenToSellInput } from './SwapTokenInput/TokenToSellInput';
import { SwapTimeEstimate, getSwapActions } from './getSwapActions';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MissingPriceExplanation = ({
  assetToBuy,
  assetToSell,
}: {
  assetToBuy: ParsedSearchAsset | null;
  assetToSell: ParsedSearchAsset | null;
}) => {
  const missingPriceSymbols = [assetToBuy, assetToSell].reduce(
    (symbols, asset) => {
      if (asset?.price?.value === undefined && asset?.symbol) {
        return [...symbols, asset?.symbol];
      }
      return symbols;
    },
    [] as string[],
  );
  if (!missingPriceSymbols?.length) return null;
  return (
    <ButtonOverflow>
      <Box paddingHorizontal="20px">
        <Box paddingVertical="10px" paddingHorizontal="12px">
          <Inline space="8px" alignVertical="center" alignHorizontal="center">
            <Inline space="4px" alignVertical="center">
              <Symbol
                symbol="exclamationmark.triangle.fill"
                size={16}
                color={'orange'}
                weight="bold"
              />
              <Text color="label" size="14pt" weight="bold">
                {i18n.t('swap.warnings.unknown_price.title', {
                  symbol: missingPriceSymbols.join('/'),
                })}
              </Text>
            </Inline>
            <Box paddingHorizontal="12px" paddingBottom="6px" paddingTop="4px">
              <Text
                color="labelTertiary"
                size="12pt"
                weight="semibold"
                align="center"
              >
                {i18n.t('swap.warnings.unknown_price.description')}
              </Text>
            </Box>
          </Inline>
        </Box>
      </Box>
    </ButtonOverflow>
  );
};

export function Swap({ bridge = false }: { bridge?: boolean }) {
  const [showSwapSettings, setShowSwapSettings] = useState(false);
  const [showSwapReview, setShowSwapReview] = useState(false);
  const [inReviewSheet, setInReviewSheet] = useState(false);
  const [inputToOpenOnMount, setInputToOpenOnMount] = useState<
    'sell' | 'buy' | null
  >(null);
  const [defaultAssetWasSet, setDefaultAssetWasSet] = useState<boolean>(false);
  const [defaultValueWasSet, setDefaultValueWasSet] = useState<boolean>(false);
  const { isFirefox } = useBrowser();

  // translate based on the context, bridge or swap
  const translationContext = {
    Action: i18n.t(`swap._actions.${bridge ? 'Bridge' : 'Swap'}`),
    action: i18n.t(`swap._actions.${bridge ? 'bridge' : 'swap'}`),
    actions: i18n.t(`swap._actions.${bridge ? 'bridges' : 'swaps'}`),
    Actioning: i18n.t(`swap._actions.${bridge ? 'Bridging' : 'Swapping'}`),
    actioning: i18n.t(`swap._actions.${bridge ? 'bridging' : 'swapping'}`),
  };
  const t = useTranslationContext(translationContext);

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();
  const { selectedGas, clearCustomGasModified } = useGasStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const { currentAddress: address } = useCurrentAddressStore();
  const { selectedToken, setSelectedToken } = useSelectedTokenStore();
  const [urlSearchParams] = useSearchParams();
  const { hidden } = useHiddenAssetStore();

  const isHidden = useCallback(
    (asset: ParsedUserAsset | SearchAsset) => {
      return !!hidden[address]?.[computeUniqueIdForHiddenAsset(asset)];
    },
    [address, hidden],
  );

  const hideBackButton = urlSearchParams.get('hideBack') === 'true';

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
    assetsToBuySearchStatus,
    outputChainId,
    setSortMethod,
    setOutputChainId,
    setAssetToSell,
    setAssetToBuy,
    setAssetToSellFilter,
    setAssetToBuyFilter,
  } = useSwapAssets({ bridge });

  const unhiddenAssetsToSell = useMemo(
    () => assetsToSell.filter((asset) => !isHidden(asset)),
    [assetsToSell, isHidden],
  );

  const unhiddenAssetsToBuy = useMemo(() => {
    return assetsToBuy.map((assets) => {
      return {
        ...assets,
        data: assets.data.filter((asset) => !isHidden(asset)),
      };
    });
  }, [assetsToBuy, isHidden]);

  const { toSellInputHeight, toBuyInputHeight } = useSwapDropdownDimensions({
    assetToSell,
    assetToBuy,
  });

  const {
    source,
    slippage,
    setSettings,
    swapFlashbotsEnabled,
    slippageManuallyUpdated,
  } = useSwapSettings({
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
    assetToSellNativeValue,
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
    setAssetToSellInputNativeValue,
    setAssetToBuyValue,
    setAssetToBuyInputValue,
    setIndependentField,
  } = useSwapInputs({
    assetToSell,
    assetToBuy,
    selectedGas,
    setAssetToSell,
    setAssetToBuy,
    inputToOpenOnMount,
    bridge,
  });

  const { data: swapSlippage } = useSwapSlippage({
    chainId: assetToSell?.chainId || ChainId.mainnet,
    toChainId: assetToBuy?.chainId || ChainId.mainnet,
    sellTokenAddress: assetToSell?.address as Address,
    buyTokenAddress: assetToBuy?.address as Address,
    sellAmount: assetToSellValue,
    buyAmount: assetToBuyValue,
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
    slippage:
      !slippageManuallyUpdated && swapSlippage?.slippagePercent !== undefined
        ? swapSlippage?.slippagePercent
        : slippage,
  });

  const { assetToSellNativeDisplay, assetToBuyNativeDisplay } =
    useSwapNativeAmounts({
      assetToBuy,
      assetToBuyValue,
      assetToSell,
      assetToSellValue,
      isWrapOrUnwrapEth,
      quote: (quote as QuoteError)?.error
        ? undefined
        : (quote as Quote | CrosschainQuote),
    });

  const { priceImpact } = useSwapPriceImpact({
    isLoading,
    assetToSellNativeValue: assetToSellNativeDisplay,
    assetToBuyNativeValue: assetToBuyNativeDisplay,
  });

  const {
    buttonLabel: validationButtonLabel,
    enoughAssetsForSwap,
    readyForReview,
  } = useSwapValidations({
    assetToSell,
    assetToSellValue,
    selectedGas,
  });

  const showSwapReviewSheet = useCallback(() => {
    if (readyForReview) {
      setShowSwapReview(true);
      setInReviewSheet(true);
    }
  }, [readyForReview]);

  const {
    buttonLabel,
    buttonLabelColor,
    buttonDisabled,
    buttonIcon,
    buttonColor,
    timeEstimate,
    buttonAction,
    status,
  } = getSwapActions({
    quote,
    isLoading,
    assetToSell,
    assetToBuy,
    enoughAssetsForSwap,
    validationButtonLabel,
    showExplainerSheet,
    hideExplainerSheet,
    showSwapReviewSheet,
    t,
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

  const tokenToBuyInputRef = useRef<TokenInputRef>();

  const selectAssetToSell = useCallback(
    (asset: ParsedSearchAsset | null) => {
      setAssetToSell(asset);
      if (!assetToBuy) tokenToBuyInputRef.current?.openDropdown();
      setAssetToSellInputValue('');
      setAssetToBuyInputValue('');
    },
    [
      setAssetToBuyInputValue,
      setAssetToSell,
      setAssetToSellInputValue,
      assetToBuy,
    ],
  );

  const {
    swapAmount: savedAmount,
    swapField: savedField,
    swapTokenToBuy: savedTokenToBuy,
    swapTokenToSell: savedTokenToSell,
    resetSwapValues,
  } = usePopupInstanceStore();

  const [didPopulateSavedTokens, setDidPopulateSavedTokens] = useState(false);
  const [didPopulateSavedInputValues, setDidPopulateSavedInputValues] =
    useState(false);
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
      if (!didPopulateSavedTokens) {
        if (savedTokenToBuy) {
          setAssetToBuy(savedTokenToBuy);
        }
        if (savedTokenToSell) {
          setAssetToSell(savedTokenToSell);
        } else {
          setAssetToSell(unhiddenAssetsToSell[0]);
          setDefaultAssetWasSet(true);
        }
        setDidPopulateSavedTokens(true);
      }
      if (didPopulateSavedTokens && !didPopulateSavedInputValues) {
        const field = savedField || 'sellField';
        if (savedAmount) {
          if (field === 'buyField') {
            setAssetToBuyInputValue(savedAmount);
          } else if (field === 'sellField') {
            setAssetToSellInputValue(savedAmount);
          } else {
            setAssetToSellInputNativeValue(savedAmount);
          }
        }
        setDidPopulateSavedInputValues(true);

        switch (field) {
          case 'buyField':
            assetToBuyInputRef.current?.focus();
            break;
          case 'sellField':
            assetToSellInputRef.current?.focus();
            break;
        }
      }
    }

    if (defaultAssetWasSet && !defaultValueWasSet) {
      setAssetToSellMaxValue();
      setDefaultValueWasSet(true);
      assetToBuyInputRef.current?.focus();
    }

    return () => {
      if (bridge) {
        // only persist swaps, not bridges
        resetSwapValues();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didPopulateSavedInputValues, didPopulateSavedTokens, resetSwapValues]);

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
          trackShortcut({
            key: shortcuts.swap.FLIP_ASSETS.display,
            type: 'swap.flipAssets',
          });
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
            trackShortcut({
              key: shortcuts.swap.SET_MAX_AMOUNT.display,
              type: 'swap.setMax',
            });
            e.preventDefault();
            setAssetToSellMaxValue();
          }
        }
      }
    },
  });

  const assetToBuyAccentColor =
    assetToBuy?.colors?.primary || assetToBuy?.colors?.fallback;

  return (
    <TranslationContext value={translationContext}>
      <Navbar
        title={t('swap.title')}
        background={'surfaceSecondary'}
        leftComponent={!hideBackButton ? <Navbar.CloseButton /> : undefined}
        rightComponent={
          <ButtonSymbol
            color="surfaceSecondaryElevated"
            height={'32px'}
            onClick={openSettings}
            symbol="switch.2"
            symbolColor="labelSecondary"
            variant="flat"
            testId="swap-settings-navbar-button"
            tabIndex={0}
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
        assetToSellValue={assetToSellValue}
      />
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
        linkButton={explainerSheetParams.linkButton}
        footerLinkText={explainerSheetParams.footerLinkText}
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
              <AccentColorProvider
                color={
                  assetToSell?.colors?.primary || assetToSell?.colors?.fallback
                }
              >
                <TokenToSellInput
                  dropdownHeight={toSellInputHeight}
                  asset={assetToSell}
                  assets={unhiddenAssetsToSell}
                  selectAsset={selectAssetToSell}
                  onDropdownOpen={onAssetToSellInputOpen}
                  dropdownClosed={assetToSellDropdownClosed}
                  setSortMethod={setSortMethod}
                  assetFilter={assetToSellFilter}
                  setAssetFilter={setAssetToSellFilter}
                  sortMethod={sortMethod}
                  zIndex={2}
                  placeholder={t('swap.input_token_placeholder')}
                  assetToSellMaxValue={assetToSellMaxValue}
                  setAssetToSellMaxValue={setAssetToSellMaxValue}
                  assetToSellValue={
                    independentField === 'sellNativeField'
                      ? assetToSellDisplay
                      : assetToSellValue
                  }
                  setAssetToSellInputValue={setAssetToSellInputValue}
                  inputRef={assetToSellInputRef}
                  openDropdownOnMount={inputToOpenOnMount === 'sell'}
                  assetToSellNativeValue={assetToSellNativeValue}
                  assetToSellNativeDisplay={assetToSellNativeDisplay}
                  setAssetToSellInputNativeValue={
                    setAssetToSellInputNativeValue
                  }
                  independentField={independentField}
                  setIndependentField={setIndependentField}
                />
              </AccentColorProvider>

              <Box
                marginTop="-18px"
                marginBottom="-20px"
                style={{ zIndex: assetToSellDropdownClosed ? 3 : 1 }}
              >
                <Inline alignHorizontal="center">
                  <CursorTooltip
                    align="center"
                    arrowAlignment="center"
                    text={i18n.t('tooltip.flip_tokens')}
                    textWeight="bold"
                    textSize="12pt"
                    textColor="labelSecondary"
                    hint={shortcuts.swap.FLIP_ASSETS.display}
                  >
                    <ButtonOverflow testId="swap-flip-button">
                      <Lens
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
                              <Box marginBottom={isFirefox ? '-9px' : '-4px'}>
                                <ChevronDown color="labelTertiary" />
                              </Box>
                              <Box marginTop="-4px">
                                <ChevronDown color="labelQuaternary" />
                              </Box>
                            </Stack>
                          </Inline>
                        </Box>
                      </Lens>
                    </ButtonOverflow>
                  </CursorTooltip>
                </Inline>
              </Box>

              <AccentColorProvider color={assetToBuyAccentColor}>
                <TokenToBuyInput
                  ref={tokenToBuyInputRef}
                  dropdownHeight={toBuyInputHeight}
                  assetToBuy={assetToBuy}
                  assetsToBuySearchStatus={assetsToBuySearchStatus}
                  assetToSell={assetToSell}
                  assets={unhiddenAssetsToBuy}
                  selectAsset={setAssetToBuy}
                  onDropdownOpen={onAssetToBuyInputOpen}
                  dropdownClosed={assetToBuyDropdownClosed}
                  zIndex={1}
                  placeholder={t('swap.input_token_to_receive_placeholder')}
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
                  assetToBuyNativeDisplay={assetToBuyNativeDisplay}
                  assetToSellNativeDisplay={assetToSellNativeDisplay}
                  setIndependentField={setIndependentField}
                />
              </AccentColorProvider>

              <SwapWarning
                timeEstimate={timeEstimate}
                priceImpact={priceImpact}
              />
              {/* <MissingPriceExplanation
                assetToBuy={assetToBuy}
                assetToSell={assetToSell}
              /> */}
            </Stack>
          </Row>
          <Row height="content">
            {!!assetToBuy && !!assetToSell ? (
              <AccentColorProvider color={assetToBuyAccentColor}>
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
              </AccentColorProvider>
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
                    {t('swap.select_tokens')}
                  </Text>
                </Button>
              </Box>
            )}
          </Row>
        </Rows>
      </Box>
    </TranslationContext>
  );
}
