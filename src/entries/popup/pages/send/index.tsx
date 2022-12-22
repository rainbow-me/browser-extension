import { TransactionRequest } from '@ethersproject/abstract-provider';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Address } from 'wagmi';

import { i18n } from '~/core/languages';
import { useContactsStore } from '~/core/state/contacts';
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { ChainId } from '~/core/types/chains';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
} from '~/design-system';
import { foregroundColors } from '~/design-system/styles/designTokens';

import { Navbar } from '../../components/Navbar/Navbar';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { sendTransaction } from '../../handlers/wallet';
import { useSendTransactionAsset } from '../../hooks/send/useSendTransactionAsset';
import { useSendTransactionInputs } from '../../hooks/send/useSendTransactionInputs';
import { useSendTransactionState } from '../../hooks/send/useSendTransactionState';

import { ContactAction, ContactPrompt } from './ContactPrompt';
import { NavbarContactButton } from './NavbarContactButton';
import { ReviewSheet } from './ReviewSheet';
import { ToAddressInput } from './ToAddressInput';
import { TokenInput } from './TokenInput';
import { ValueInput } from './ValueInput';

export const AccentColorProviderWrapper = ({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) => {
  const { currentTheme } = useCurrentThemeStore();
  const defaultColor =
    currentTheme === 'light'
      ? foregroundColors.labelQuaternary.dark
      : foregroundColors.labelQuaternary.light;
  return (
    <AccentColorProvider color={color ?? defaultColor}>
      {children}
    </AccentColorProvider>
  );
};

export function Send() {
  const [, setTxHash] = useState('');
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [contactSaveAction, setSaveContactAction] = useState<{
    show: boolean;
    action: ContactAction;
  }>({ show: false, action: 'save' });
  const [toAddressDropdownOpen, setToAddressDropdownOpen] = useState(false);

  const { isContact } = useContactsStore();
  const { connectedToHardhat } = useConnectedToHardhatStore();

  const { asset, selectAssetAddress, assets, setSortMethod, sortMethod } =
    useSendTransactionAsset();
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
  } = useSendTransactionInputs({ asset });

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
  } = useSendTransactionState({ assetAmount, asset });

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
    if (!!toAddress && independentAmount) {
      setShowReviewSheet(true);
    }
  }, [independentAmount, toAddress]);
  const closeReviewSheet = useCallback(() => setShowReviewSheet(false), []);

  const handleSend = useCallback(async () => {
    try {
      const result = await sendTransaction({
        from: fromAddress,
        to: toAddress,
        value,
        chainId:
          chainId === ChainId.mainnet && connectedToHardhat
            ? ChainId.hardhat
            : chainId,
        data,
      });

      if (result) {
        alert(`Transaction sent successfully: ${JSON.stringify(result.hash)}`);
        setTxHash(result?.hash as string);
        const transaction = {
          amount: assetAmount,
          asset,
          data: result.data,
          value: result.value,
          from: fromAddress,
          to: toAddress,
          hash: result.hash,
          chainId,
          status: TransactionStatus.sending,
          type: TransactionType.send,
        };
        if (fromAddress) {
          console.log('ADDING NEW TRANSACTION: ', transaction);
          await addNewTransaction({
            address: fromAddress,
            chainId,
            transaction,
          });
        }
      }
    } catch (e) {
      alert('Transaction failed');
    }
  }, [
    fromAddress,
    toAddress,
    value,
    chainId,
    connectedToHardhat,
    data,
    assetAmount,
    asset,
  ]);

  const selectAsset = useCallback(
    (address: Address | '') => {
      selectAssetAddress(address);
      setIndependentAmount('');
    },
    [selectAssetAddress, setIndependentAmount],
  );

  const navbarButtonAction = isContact({ address: toAddress })
    ? 'edit'
    : 'save';

  return (
    <>
      <ContactPrompt
        address={toAddress}
        show={contactSaveAction?.show}
        action={contactSaveAction?.action}
        onSaveContactAction={setSaveContactAction}
      />
      <ReviewSheet
        show={showReviewSheet}
        onCancel={closeReviewSheet}
        onSend={handleSend}
        toAddress={toAddress}
        asset={asset}
        primaryAmountDisplay={independentAmountDisplay.display}
        secondaryAmountDisplay={dependentAmountDisplay.display}
        onSaveContactAction={setSaveContactAction}
      />
      <Navbar
        title={i18n.t('send.title')}
        background={'surfaceSecondary'}
        leftComponent={<Navbar.BackButton />}
        rightComponent={
          <NavbarContactButton
            onSaveAction={setSaveContactAction}
            toAddress={toAddress}
            action={navbarButtonAction}
            enabled={!!toAddress}
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
                  <TokenInput
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
                    />
                  ) : null}
                </Box>
              </AccentColorProviderWrapper>
            </Row>
          </Rows>

          <Row height="content">
            {asset ? (
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
                          <Symbol
                            symbol="doc.text.magnifyingglass"
                            weight="bold"
                            size={16}
                          />
                          <Text color="label" size="16pt" weight="bold">
                            {i18n.t('send.button_label_review')}
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
                >
                  <Text color="labelQuaternary" size="14pt" weight="bold">
                    {i18n.t('send.enter_address_or_amount')}
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
