import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useAnimationControls } from 'framer-motion';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Address } from 'wagmi';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { ETH_ADDRESS } from '~/core/references';
import { useGasStore } from '~/core/state';
import { useContactsStore } from '~/core/state/contacts';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { ChainId } from '~/core/types/chains';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import { Box, Button, Inline, Row, Rows, Symbol, Text } from '~/design-system';
import { AccentColorProviderWrapper } from '~/design-system/components/Box/ColorContext';

import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../components/ExplainerSheet/ExplainerSheet';
import { Navbar } from '../../components/Navbar/Navbar';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { getWallet, sendTransaction } from '../../handlers/wallet';
import { useSendAsset } from '../../hooks/send/useSendAsset';
import { useSendInputs } from '../../hooks/send/useSendInputs';
import { useSendState } from '../../hooks/send/useSendState';
import { useSendValidations } from '../../hooks/send/useSendValidations';
import usePrevious from '../../hooks/usePrevious';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { ContactAction, ContactPrompt } from './ContactPrompt';
import { NavbarContactButton } from './NavbarContactButton';
import { ReviewSheet } from './ReviewSheet';
import { SendTokenInput } from './SendTokenInput';
import { ToAddressInput } from './ToAddressInput';
import { ValueInput } from './ValueInput';

export function Send() {
  const [waitingForDevice, setWaitingForDevice] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [contactSaveAction, setSaveContactAction] = useState<{
    show: boolean;
    action: ContactAction;
  }>({ show: false, action: 'save' });
  const [toAddressDropdownOpen, setToAddressDropdownOpen] = useState(false);

  const navigate = useRainbowNavigate();

  const { isContact } = useContactsStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const { asset, selectAssetAddress, assets, setSortMethod, sortMethod } =
    useSendAsset();

  const { clearCustomGasModified, selectedGas } = useGasStore();

  const {
    assetAmount,
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
    chainId,
    data,
    fromAddress,
    toAddress,
    toAddressOrName,
    toEnsName,
    txToAddress,
    value,
    setToAddressOrName,
  } = useSendState({ assetAmount, asset });

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
  const transactionRequest: TransactionRequest = useMemo(() => {
    return {
      to: txToAddress,
      from: fromAddress,
      value,
      chainId,
      data,
    };
  }, [txToAddress, fromAddress, value, chainId, data]);

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
          };
          await addNewTransaction({
            address: fromAddress,
            chainId,
            transaction,
          });
          callback?.();
          navigate(ROUTES.HOME, { state: { activeTab: 'activity' } });
        }
      } catch (e) {
        alert('Transaction failed');
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
      navigate,
    ],
  );

  const selectAsset = useCallback(
    (address: Address | typeof ETH_ADDRESS | '') => {
      selectAssetAddress(address);
      setIndependentAmount('');
    },
    [selectAssetAddress, setIndependentAmount],
  );

  const navbarButtonAction = isContact({ address: toAddress })
    ? 'edit'
    : 'save';

  useEffect(() => () => clearCustomGasModified(), [clearCustomGasModified]);

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

  const prevToAddressIsSmartContract = usePrevious(toAddressIsSmartContract);
  useEffect(() => {
    if (
      !prevToAddressIsSmartContract &&
      toAddressIsSmartContract &&
      !toEnsName.includes('argent.xyz')
    ) {
      showToContractExplainer();
    }
  }, [
    prevToAddressIsSmartContract,
    showToContractExplainer,
    toAddressIsSmartContract,
    toEnsName,
  ]);

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
      />
      <AccentColorProviderWrapper
        color={asset?.colors?.primary || asset?.colors?.fallback}
      >
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
          <NavbarContactButton
            onSaveAction={setSaveContactAction}
            toAddress={toAddress}
            action={navbarButtonAction}
            enabled={!!toAddress}
            chainId={asset?.chainId}
          />
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
              />
            </Row>

            <Row height="content">
              <AccentColorProviderWrapper
                color={asset?.colors?.primary || asset?.colors?.fallback}
              >
                <Box
                  background="surfaceSecondaryElevated"
                  borderRadius="24px"
                  width="full"
                >
                  <SendTokenInput
                    asset={asset}
                    assets={assets}
                    selectAssetAddress={selectAsset}
                    dropdownClosed={toAddressDropdownOpen}
                    setSortMethod={setSortMethod}
                    sortMethod={sortMethod}
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
                    />
                  ) : null}
                </Box>
              </AccentColorProviderWrapper>
            </Row>
          </Rows>

          <Row height="content">
            {isValidToAddress && !!asset ? (
              <AccentColorProviderWrapper
                color={asset?.colors?.primary || asset?.colors?.fallback}
              >
                <Box paddingHorizontal="8px">
                  <Rows space="20px">
                    <Row>
                      <TransactionFee
                        chainId={chainId}
                        transactionRequest={transactionRequest}
                        accentColor={
                          asset?.colors?.primary || asset?.colors?.fallback
                        }
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
