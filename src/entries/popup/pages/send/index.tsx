import { TransactionRequest } from '@ethersproject/abstract-provider';
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import {
  AccentColorProvider,
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { foregroundColors } from '~/design-system/styles/designTokens';

import { CoinIcon } from '../../components/CoinIcon/CoinIcon';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { sendTransaction } from '../../handlers/wallet';
import { useSendTransactionAsset } from '../../hooks/send/useSendTransactionAsset';
import { useSendTransactionInputs } from '../../hooks/send/useSendTransactionInputs';
import { useSendTransactionState } from '../../hooks/send/useSendTransactionState';

const ActionButon = ({
  showClose,
  onClose,
}: {
  showClose: boolean;
  onClose: () => void;
}) => {
  return showClose ? (
    <Box
      style={{
        width: 24,
        height: 24,
      }}
      borderRadius="12px"
      background="surfaceMenu"
      borderWidth="1px"
      borderColor="buttonStroke"
      onClick={onClose}
    >
      <Inline height="full" alignHorizontal="center" alignVertical="center">
        <Symbol size={8} symbol={'xmark'} weight="bold" color="label" />
      </Inline>
    </Box>
  ) : (
    <Symbol
      size={18}
      symbol={'chevron.down.circle'}
      weight="semibold"
      color="labelQuaternary"
    />
  );
};

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

  const { asset, shuffleAssetIndex } = useSendTransactionAsset();
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
      }
    } catch (e) {
      alert('Transaction failed');
    } finally {
      setSending(false);
    }
  }, [fromAddress, toAddress, value, chainId, data]);

  return (
    <AccentColorProviderWrapper
      color={asset?.colors?.primary || asset?.colors?.fallback}
    >
      <Box style={{ overflow: 'auto' }} paddingHorizontal="12px" height="full">
        <Rows space="8px">
          <Row>
            <Box
              background="surfaceSecondaryElevated"
              paddingVertical="20px"
              paddingHorizontal="16px"
              borderRadius="24px"
              width="full"
            >
              <Inline
                alignHorizontal="justify"
                alignVertical="center"
                space="8px"
              >
                <Inline alignVertical="center" space="8px">
                  <WalletAvatar
                    address={toAddress}
                    size={36}
                    emojiSize="20pt"
                  />
                  <Box width="fit">
                    <Input
                      value={toAddressOrName}
                      placeholder={i18n.t('send.input_to_address_placeholder')}
                      onChange={handleToAddressChange}
                      height="32px"
                      variant="transparent"
                    />
                  </Box>
                </Inline>
                <ActionButon showClose={!!toAddress} onClose={clearToAddress} />
              </Inline>
            </Box>
          </Row>

          <Row>
            <Box
              background="surfaceSecondaryElevated"
              paddingVertical="20px"
              paddingHorizontal="20px"
              borderRadius="24px"
              width="full"
            >
              <Stack space="16px">
                <Inline
                  alignHorizontal="justify"
                  alignVertical="center"
                  space="8px"
                >
                  <Box onClick={() => shuffleAssetIndex()}>
                    <Inline alignVertical="center" space="8px">
                      <Box>
                        <CoinIcon asset={asset ?? undefined} />
                      </Box>
                      <Box width="fit">
                        <Text
                          size="16pt"
                          weight="semibold"
                          color={`${asset ? 'label' : 'labelTertiary'}`}
                        >
                          {asset?.name ??
                            i18n.t('send.input_token_placeholder')}
                        </Text>
                      </Box>
                    </Inline>
                  </Box>
                  <ActionButon
                    showClose={!!asset}
                    onClose={() => shuffleAssetIndex(-1)}
                  />
                </Inline>

                {asset ? (
                  <>
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
                              <Text color="accent" size="12pt" weight="bold">
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
                  </>
                ) : null}
              </Stack>
            </Box>
          </Row>
        </Rows>
        {asset ? (
          <Box style={{ paddingTop: 143 }} padding="20px" bottom="0">
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
                        sending ? 'button_label_sending' : 'button_label_send'
                      }`,
                    )}
                  </Text>
                </Button>
              </Row>
            </Rows>
          </Box>
        ) : (
          <Box style={{ paddingTop: 310 }}>
            <Button height="44px" variant="flat" color="accent" width="full">
              <Text color="labelQuaternary" size="14pt" weight="bold">
                {i18n.t('send.enter_address_or_amount')}
              </Text>
            </Button>
          </Box>
        )}
      </Box>
    </AccentColorProviderWrapper>
  );
}
