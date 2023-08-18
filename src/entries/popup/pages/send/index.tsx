import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useAnimationControls } from 'framer-motion';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { shortcuts } from '~/core/references/shortcuts';
import { useGasStore } from '~/core/state';
import { useContactsStore } from '~/core/state/contacts';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useSelectedTokenStore } from '~/core/state/selectedToken';
import { ChainId } from '~/core/types/chains';
import {
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { handleAssetAccentColor } from '~/core/utils/colors';
import { addNewTransaction } from '~/core/utils/transactions';
import { Box, Button, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';
import { RainbowError, logger } from '~/logger';

import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../components/ExplainerSheet/ExplainerSheet';
import { Navbar } from '../../components/Navbar/Navbar';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { isLedgerConnectionError } from '../../handlers/ledger';
import { getWallet, sendTransaction } from '../../handlers/wallet';
import { useSendAsset } from '../../hooks/send/useSendAsset';
import { useSendInputs } from '../../hooks/send/useSendInputs';
import { useSendState } from '../../hooks/send/useSendState';
import { useSendValidations } from '../../hooks/send/useSendValidations';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import usePrevious from '../../hooks/usePrevious';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useWallets } from '../../hooks/useWallets';
import { ROUTES } from '../../urls';
import { clickHeaderRight } from '../../utils/clickHeader';

import { ContactAction, ContactPrompt } from './ContactPrompt';
import { NavbarContactButton } from './NavbarContactButton';
import { ReviewSheet } from './ReviewSheet';
import { SendTokenInput } from './SendTokenInput';
import { ToAddressInput } from './ToAddressInput';
import { ValueInput } from './ValueInput';

interface ChildInputAPI {
  blur: () => void;
  focus: () => void;
  isFocused?: () => boolean;
}

export function Send() {
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [contactSaveAction, setSaveContactAction] = useState<{
    show: boolean;
    action: ContactAction;
  }>({ show: false, action: 'save' });
  const [toAddressDropdownOpen, setToAddressDropdownOpen] = useState(false);

  const { currentTheme } = useCurrentThemeStore();
  const navigate = useRainbowNavigate();

  const { isContact } = useContactsStore();
  const { allWallets } = useWallets();
  const isMyWallet = (address: Address) =>
    allWallets?.some((w) => w.address === address);

  const { connectedToHardhat } = useConnectedToHardhatStore();

  const {
    asset,
    selectAssetAddressAndChain,
    assets,
    setSortMethod,
    sortMethod,
  } = useSendAsset();

  const { clearCustomGasModified, selectedGas } = useGasStore();

  const { selectedToken, setSelectedToken } = useSelectedTokenStore();
  const { trackShortcut } = useKeyboardAnalytics();

  const toAddressInputRef = useRef<ChildInputAPI>(null);
  const sendTokenInputRef = useRef<ChildInputAPI>(null);
  const valueInputRef = useRef<ChildInputAPI>(null);

  const {
    assetAmount,
    rawMaxAssetBalanceAmount,
    independentAmount,
    independentField,
    independentFieldRef,
    dependentAmountDisplay,
    independentAmountDisplay,
    setIndependentAmount,
    switchIndependentField,
    setMaxAssetAmount,
  } = useSendInputs({ asset, selectedGas });

  const {
    currentCurrency,
    maxAssetBalanceParams,
    chainId,
    data,
    fromAddress,
    toAddress,
    toAddressOrName,
    toEnsName,
    txToAddress,
    value,
    setToAddressOrName,
  } = useSendState({ assetAmount, rawMaxAssetBalanceAmount, asset });

  const {
    buttonLabel,
    isValidToAddress,
    readyForReview,
    validateToAddress,
    toAddressIsSmartContract,
  } = useSendValidations({
    asset,
    assetAmount,
    selectedGas,
    toAddress,
    toAddressOrName,
  });

  const controls = useAnimationControls();
  const transactionRequestForGas: TransactionRequest = useMemo(() => {
    return {
      to: txToAddress,
      from: fromAddress,
      value,
      chainId,
      data,
      ...maxAssetBalanceParams,
    };
  }, [txToAddress, fromAddress, value, chainId, data, maxAssetBalanceParams]);

  const handleToAddressChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setToAddressOrName(e.target.value);
    },
    [setToAddressOrName],
  );

  const clearToAddress = useCallback(
    () => setToAddressOrName(''),
    [setToAddressOrName],
  );

  const openReviewSheet = useCallback(() => {
    if (readyForReview) {
      setShowReviewSheet(true);
    } else {
      controls.start({
        rotate: [1, -1.4, 0, 1, -1.4, 0],
        transition: { duration: 0.2 },
      });
      independentFieldRef?.current?.focus();
    }
  }, [readyForReview, controls, independentFieldRef]);

  const closeReviewSheet = useCallback(() => setShowReviewSheet(false), []);

  const handleSend = useCallback(
    async (callback?: () => void) => {
      if (!config.send_enabled) return;

      try {
        const { type } = await getWallet(fromAddress);

        // Change the label while we wait for confirmation
        if (type === 'HardwareWalletKeychain') {
          setWaitingForDevice(true);
        }
        const result = await sendTransaction({
          from: fromAddress,
          to: txToAddress,
          value,
          chainId: connectedToHardhat ? ChainId.hardhat : chainId,
          data,
        });
        if (result) {
          const transaction = {
            amount: assetAmount,
            asset,
            data: result.data,
            value: result.value,
            from: fromAddress,
            to: txToAddress,
            hash: result.hash,
            chainId,
            status: TransactionStatus.sending,
            type: TransactionType.send,
            nonce: result.nonce,
            gasPrice: (
              selectedGas.transactionGasParams as TransactionLegacyGasParams
            )?.gasPrice,
            maxFeePerGas: (
              selectedGas.transactionGasParams as TransactionGasParams
            )?.maxFeePerGas,
            maxPriorityFeePerGas: (
              selectedGas.transactionGasParams as TransactionGasParams
            )?.maxPriorityFeePerGas,
          };
          await addNewTransaction({
            address: fromAddress,
            chainId,
            transaction,
          });
          callback?.();
          navigate(ROUTES.HOME, { state: { activeTab: 'activity' } });
          analytics.track(event.sendSubmitted, {
            assetSymbol: asset?.symbol,
            assetName: asset?.name,
            assetAddress: asset?.address,
            assetAmount,
            chainId,
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!isLedgerConnectionError(e)) {
          alert('Transaction failed');
        }
        logger.error(new RainbowError('send: error executing send'), {
          message: (e as Error)?.message,
        });
        console.log('error sending transaction', e);
      } finally {
        setWaitingForDevice(false);
      }
    },
    [
      fromAddress,
      txToAddress,
      value,
      connectedToHardhat,
      chainId,
      data,
      assetAmount,
      asset,
      selectedGas.transactionGasParams,
      navigate,
    ],
  );

  const selectAsset = useCallback(
    (address: Address | typeof ETH_ADDRESS | '', chainId: ChainId) => {
      selectAssetAddressAndChain(address as Address, chainId);
      setIndependentAmount('');
      setTimeout(() => {
        valueInputRef?.current?.focus();
      }, 300);
    },
    [selectAssetAddressAndChain, setIndependentAmount],
  );

  useEffect(() => {
    return () => {
      clearCustomGasModified();
    };
  }, [clearCustomGasModified]);

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();

  const showToContractExplainer = useCallback(() => {
    showExplainerSheet({
      show: true,
      title: i18n.t('explainers.send.to_smart_contract.title'),
      description: [
        i18n.t('explainers.send.to_smart_contract.description_1'),
        i18n.t('explainers.send.to_smart_contract.description_2'),
        i18n.t('explainers.send.to_smart_contract.description_3'),
      ],
      actionButton: {
        label: i18n.t('explainers.send.action_label'),
        variant: 'tinted',
        labelColor: 'blue',
        action: hideExplainerSheet,
      },
      header: { emoji: '✋' },
    });
  }, [hideExplainerSheet, showExplainerSheet]);

  useEffect(() => {
    // navigating from token row
    if (selectedToken) {
      selectAsset(selectedToken.address, selectedToken.chainId);
      // clear selected token
      setSelectedToken();
    }
  }, [selectAsset, selectedToken, setSelectedToken]);

  const prevToAddressIsSmartContract = usePrevious(toAddressIsSmartContract);
  useEffect(() => {
    if (
      !prevToAddressIsSmartContract &&
      toAddressIsSmartContract &&
      !toEnsName?.includes('argent.xyz')
    ) {
      showToContractExplainer();
    }
  }, [
    prevToAddressIsSmartContract,
    showToContractExplainer,
    toAddressIsSmartContract,
    toEnsName,
  ]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === shortcuts.send.FOCUS_TO_ADDRESS.key) {
          trackShortcut({
            key: shortcuts.send.FOCUS_TO_ADDRESS.display,
            type: 'send.focusToAddress',
          });
          toAddressInputRef?.current?.focus();
          sendTokenInputRef?.current?.blur();
        }
        if (e.key === shortcuts.send.FOCUS_ASSET.key) {
          trackShortcut({
            key: shortcuts.send.FOCUS_ASSET.display,
            type: 'send.focusAsset',
          });
          toAddressInputRef?.current?.blur();
          sendTokenInputRef.current?.focus();
        }
      } else {
        if (!toAddressInputRef.current?.isFocused?.()) {
          if (e.key === shortcuts.send.SET_MAX_AMOUNT.key) {
            trackShortcut({
              key: shortcuts.send.SET_MAX_AMOUNT.display,
              type: 'send.setMax',
            });
            setMaxAssetAmount();
          }
          if (e.key === shortcuts.send.SWITCH_CURRENCY_LABEL.key) {
            trackShortcut({
              key: shortcuts.send.SWITCH_CURRENCY_LABEL.display,
              type: 'send.switchCurrency',
            });
            switchIndependentField();
          }
        }
        if (
          e.key === shortcuts.send.OPEN_CONTACT_MENU.key &&
          !valueInputRef.current?.isFocused?.()
        ) {
          trackShortcut({
            key: shortcuts.send.OPEN_CONTACT_MENU.display,
            type: 'send.openContactMenu',
          });
          clickHeaderRight();
        }
      }
    },
  });

  const assetAccentColor = useMemo(
    () =>
      handleAssetAccentColor(
        currentTheme,
        asset?.colors?.primary || asset?.colors?.fallback,
      ),
    [asset?.colors?.fallback, asset?.colors?.primary, currentTheme],
  );

  return (
    <>
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
      />
      <ContactPrompt
        address={toAddress}
        show={contactSaveAction?.show}
        action={contactSaveAction?.action}
        onSaveContactAction={setSaveContactAction}
        handleClose={() =>
          setSaveContactAction({ show: false, action: 'save' })
        }
      />
      <AccentColorProviderWrapper color={assetAccentColor}>
        <ReviewSheet
          show={showReviewSheet}
          onCancel={closeReviewSheet}
          onSend={handleSend}
          toAddress={toAddress}
          asset={asset}
          primaryAmountDisplay={independentAmountDisplay.display}
          secondaryAmountDisplay={dependentAmountDisplay.display}
          onSaveContactAction={setSaveContactAction}
          waitingForDevice={waitingForDevice}
        />
      </AccentColorProviderWrapper>

      <Navbar
        title={i18n.t('send.title')}
        background={'surfaceSecondary'}
        leftComponent={<Navbar.CloseButton />}
        rightComponent={
          isMyWallet(toAddress) ? undefined : (
            <NavbarContactButton
              onSaveAction={setSaveContactAction}
              toAddress={toAddress}
              action={isContact({ address: toAddress }) ? 'edit' : 'save'}
              enabled={!!toAddress}
              chainId={asset?.chainId}
            />
          )
        }
      />
      <Box
        background="surfaceSecondary"
        style={{ height: 535 }}
        paddingBottom="20px"
        paddingHorizontal="12px"
      >
        <Rows space="8px" alignVertical="top">
          <Rows space="8px" alignVertical="top">
            <Row height="content">
              <ToAddressInput
                toAddress={toAddress}
                toEnsName={toEnsName}
                toAddressOrName={toAddressOrName}
                clearToAddress={clearToAddress}
                handleToAddressChange={handleToAddressChange}
                setToAddressOrName={setToAddressOrName}
                onDropdownOpen={setToAddressDropdownOpen}
                validateToAddress={validateToAddress}
                ref={toAddressInputRef}
              />
            </Row>

            <Row height="content">
              <AccentColorProviderWrapper color={assetAccentColor}>
                <Box
                  background="surfaceSecondaryElevated"
                  borderRadius="24px"
                  width="full"
                >
                  <SendTokenInput
                    asset={asset}
                    assets={assets}
                    selectAssetAddressAndChain={selectAsset}
                    dropdownClosed={toAddressDropdownOpen}
                    setSortMethod={setSortMethod}
                    sortMethod={sortMethod}
                    ref={sendTokenInputRef}
                  />
                  {asset ? (
                    <ValueInput
                      asset={asset}
                      currentCurrency={currentCurrency}
                      dependentAmount={dependentAmountDisplay}
                      independentAmount={independentAmount}
                      independentField={independentField}
                      independentFieldRef={independentFieldRef}
                      setIndependentAmount={setIndependentAmount}
                      setMaxAssetAmount={setMaxAssetAmount}
                      switchIndependentField={switchIndependentField}
                      inputAnimationControls={controls}
                      ref={valueInputRef}
                    />
                  ) : null}
                </Box>
              </AccentColorProviderWrapper>
            </Row>
          </Rows>

          <Row height="content">
            {isValidToAddress && !!asset ? (
              <AccentColorProviderWrapper color={assetAccentColor}>
                <Box paddingHorizontal="8px">
                  <Rows space="20px">
                    <Row>
                      <TransactionFee
                        chainId={chainId}
                        transactionRequest={transactionRequestForGas}
                        accentColor={assetAccentColor}
                      />
                    </Row>
                    <Row>
                      <Button
                        onClick={openReviewSheet}
                        height="44px"
                        variant="flat"
                        color="accent"
                        width="full"
                        testId="send-review-button"
                        tabIndex={0}
                      >
                        <Inline space="8px" alignVertical="center">
                          {readyForReview && (
                            <Symbol
                              symbol="doc.text.magnifyingglass"
                              weight="bold"
                              size={16}
                            />
                          )}
                          <Text color="label" size="16pt" weight="bold">
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
                    {buttonLabel}
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
