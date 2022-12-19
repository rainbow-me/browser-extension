import { TransactionRequest } from '@ethersproject/abstract-provider';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { useContactsStore } from '~/core/state/contacts';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { TransactionStatus, TransactionType } from '~/core/types/transactions';
import { addNewTransaction } from '~/core/utils/transactions';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { foregroundColors } from '~/design-system/styles/designTokens';

import { Navbar } from '../../components/Navbar/Navbar';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { sendTransaction } from '../../handlers/wallet';
import { useSendTransactionAsset } from '../../hooks/send/useSendTransactionAsset';
import { useSendTransactionInputs } from '../../hooks/send/useSendTransactionInputs';
import { useSendTransactionState } from '../../hooks/send/useSendTransactionState';

import { ContactAction, ContactPrompt } from './ContactPrompt';
import { NavbarContactButton } from './NavbarContactButton';
import { ToAddressInput } from './ToAddressInput';
import { TokenInput } from './TokenInput';

const AccentColorProviderWrapper = ({
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
  const [sending, setSending] = useState(false);
  const [contactSaveAction, setSaveContactAction] = useState<{
    show: boolean;
    action: ContactAction;
  }>({ show: false, action: 'save' });
  const [toAddressDropdownOpen, setToAddressDropdownOpen] = useState(false);

  const { isContact } = useContactsStore();

  const { asset, selectAssetIndex, assets } = useSendTransactionAsset();
  const {
    assetAmount,
    independentAmount,
    independentField,
    independentFieldRef,
    dependentAmount,
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
    value,
    setToAddressOrName,
  } = useSendTransactionState({ assetAmount, asset });

  const transactionRequest: TransactionRequest = useMemo(() => {
    return {
      to: toAddress,
      from: fromAddress,
      value,
      chainId,
      data,
    };
  }, [toAddress, fromAddress, value, chainId, data]);

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

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setIndependentAmount(e.target.value);
    },
    [setIndependentAmount],
  );

  const handleSend = useCallback(async () => {
    setSending(true);

    try {
      const result = await sendTransaction({
        from: fromAddress,
        to: toAddress,
        value,
        chainId,
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
          await addNewTransaction({
            address: fromAddress,
            chainId,
            transaction,
          });
        }
      }
    } catch (e) {
      alert('Transaction failed');
    } finally {
      setSending(false);
    }
  }, [asset, assetAmount, fromAddress, toAddress, value, chainId, data]);

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
        style={{ height: 535, paddingBottom: 19 }}
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
                    selectAssetIndex={selectAssetIndex}
                    dropdownClosed={toAddressDropdownOpen}
                  />
                  {asset ? (
                    <Box paddingBottom="20px" paddingHorizontal="20px">
                      <Stack space="16px">
                        <Separator color="separatorSecondary" />
                        <Box>
                          <Rows space="16px">
                            <Row>
                              <Inline
                                alignVertical="center"
                                alignHorizontal="justify"
                              >
                                <Input
                                  value={independentAmount}
                                  placeholder={`0.00 ${asset?.symbol}`}
                                  borderColor="accent"
                                  onChange={handleAmountChange}
                                  height="56px"
                                  variant="bordered"
                                  innerRef={independentFieldRef}
                                  style={{
                                    paddingRight: 80,
                                  }}
                                />
                                <Box position="absolute" style={{ right: 48 }}>
                                  <Button
                                    onClick={setMaxAssetAmount}
                                    color="accent"
                                    height="32px"
                                    variant="raised"
                                  >
                                    {i18n.t('send.max')}
                                  </Button>
                                </Box>
                              </Inline>
                            </Row>

                            <Row>
                              <Inline
                                alignHorizontal="justify"
                                alignVertical="center"
                              >
                                <Box>
                                  <Text size="12pt" color="label" weight="bold">
                                    {dependentAmount.display}
                                  </Text>
                                </Box>
                                <Box onClick={switchIndependentField}>
                                  <Text
                                    color="accent"
                                    size="12pt"
                                    weight="bold"
                                  >
                                    {i18n.t('send.switch_to')}{' '}
                                    {independentField === 'asset'
                                      ? currentCurrency
                                      : asset?.symbol}
                                  </Text>
                                </Box>
                              </Inline>
                            </Row>
                          </Rows>
                        </Box>
                      </Stack>
                    </Box>
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
                      />
                    </Row>
                    <Row>
                      <Button
                        onClick={handleSend}
                        height="44px"
                        variant="flat"
                        color="accent"
                        width="full"
                      >
                        <Text color="label" size="14pt" weight="bold">
                          {i18n.t(
                            `send.${
                              sending
                                ? 'button_label_sending'
                                : 'button_label_send'
                            }`,
                          )}
                        </Text>
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
