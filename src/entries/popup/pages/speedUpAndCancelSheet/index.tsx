import { TransactionRequest } from '@ethersproject/abstract-provider';
import BigNumber from 'bignumber.js';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Address,
  useAccount,
  useBalance,
  useEnsName,
  useTransaction,
} from 'wagmi';

import { i18n } from '~/core/languages';
import { useGasStore } from '~/core/state';
import { useSelectedTransactionStore } from '~/core/state/selectedTransaction';
import { ChainId } from '~/core/types/chains';
import {
  GasSpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import {
  RainbowTransaction,
  TransactionStatus,
  TransactionType,
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import {
  greaterThan,
  handleSignificantDecimals,
  toHex,
} from '~/core/utils/numbers';
import { updateTransaction } from '~/core/utils/transactions';
import {
  Box,
  Button,
  Inline,
  Inset,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';

import { EthSymbol } from '../../components/EthSymbol/EthSymbol';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { sendTransaction } from '../../handlers/wallet';

const calcGasParamRetryValue = (prevWeiValue?: string) => {
  const prevWeiValueBN = new BigNumber(prevWeiValue || 0);

  const newWeiValueBN = prevWeiValueBN
    .times(new BigNumber('110'))
    .dividedBy(new BigNumber('100'));

  return newWeiValueBN.toFixed(0);
};

type SpeedUpAndCancelSheetProps = {
  currentSheet: SheetMode;
  onClose: () => void;
  transaction: RainbowTransaction | null;
};

// governs type of sheet displayed on top of MainLayout
// we should centralize this type if we add additional
// sheet modes to the main layout
export type SheetMode = 'cancel' | 'none' | 'speedUp';

export function SpeedUpAndCancelSheet({
  currentSheet,
  onClose,
  transaction,
}: SpeedUpAndCancelSheetProps) {
  const { setSelectedTransaction } = useSelectedTransactionStore();
  const { selectedGas } = useGasStore();

  const { data: transactionResponse } = useTransaction({
    chainId: transaction?.chainId,
    hash: transaction?.hash as `0x${string}`,
  });
  const cancel = currentSheet === 'cancel';
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const getNewTransactionGasParams = useCallback(() => {
    if (transaction?.chainId === ChainId.mainnet) {
      const transactionMaxFeePerGas =
        transactionResponse?.maxFeePerGas || transaction?.maxFeePerGas;
      const transactionMaxPriorityFeePerGas =
        transactionResponse?.maxPriorityFeePerGas ||
        transaction?.maxPriorityFeePerGas;
      const minMaxFeePerGas = calcGasParamRetryValue(
        transactionMaxFeePerGas?.toString(),
      );
      const minMaxPriorityFeePerGas = calcGasParamRetryValue(
        transactionMaxPriorityFeePerGas?.toString(),
      );
      const rawMaxPriorityFeePerGas = (
        selectedGas.transactionGasParams as TransactionGasParams
      ).maxPriorityFeePerGas;
      const rawMaxFeePerGas = (
        selectedGas.transactionGasParams as TransactionGasParams
      ).maxFeePerGas;

      const maxPriorityFeePerGas = greaterThan(
        rawMaxPriorityFeePerGas,
        minMaxPriorityFeePerGas,
      )
        ? toHex(rawMaxPriorityFeePerGas)
        : toHex(minMaxPriorityFeePerGas);

      const maxFeePerGas = greaterThan(rawMaxFeePerGas, minMaxFeePerGas)
        ? toHex(rawMaxFeePerGas)
        : toHex(minMaxFeePerGas);
      return { maxFeePerGas, maxPriorityFeePerGas };
    } else {
      const transactionGasPrice =
        transactionResponse?.gasPrice || transaction?.gasPrice;

      const minGasPrice = calcGasParamRetryValue(
        transactionGasPrice?.toString(),
      );
      const rawGasPrice = (
        selectedGas.transactionGasParams as TransactionLegacyGasParams
      ).gasPrice;
      return {
        gasPrice: greaterThan(rawGasPrice, minGasPrice)
          ? toHex(rawGasPrice)
          : toHex(minGasPrice),
      };
    }
  }, [
    transaction?.gasPrice,
    transaction?.maxFeePerGas,
    transaction?.maxPriorityFeePerGas,
    transaction?.chainId,
    transactionResponse?.gasPrice,
    transactionResponse?.maxFeePerGas,
    transactionResponse?.maxPriorityFeePerGas,
    selectedGas.transactionGasParams,
  ]);

  const speedUpTransactionRequest: TransactionRequest = useMemo(() => {
    const gasParams = getNewTransactionGasParams();
    return {
      to: transaction?.to,
      from: transaction?.from,
      value: transaction?.value,
      chainId: transaction?.chainId,
      data: transaction?.data,
      nonce: transaction?.nonce,
      ...gasParams,
    };
  }, [
    getNewTransactionGasParams,
    transaction?.chainId,
    transaction?.data,
    transaction?.from,
    transaction?.nonce,
    transaction?.to,
    transaction?.value,
  ]);
  const cancelTransactionRequest: TransactionRequest = useMemo(() => {
    const gasParams = getNewTransactionGasParams();
    return {
      to: transaction?.from,
      from: transaction?.from,
      value: toHex('0'),
      chainId: transaction?.chainId,
      data: undefined,
      nonce: transaction?.nonce,
      ...gasParams,
    };
  }, [
    getNewTransactionGasParams,
    transaction?.chainId,
    transaction?.from,
    transaction?.nonce,
  ]);

  const handleCancellation = async () => {
    const cancellationResult = await sendTransaction(cancelTransactionRequest);
    const cancelTx = {
      asset: transaction?.asset,
      data: cancellationResult?.data,
      value: cancellationResult?.value,
      from: cancellationResult?.from as Address,
      to: cancellationResult?.from as Address,
      hash: cancellationResult?.hash,
      chainId: cancelTransactionRequest?.chainId,
      status: TransactionStatus.cancelling,
      type: TransactionType.cancel,
      nonce: transaction?.nonce,
    };
    updateTransaction({
      address: cancellationResult?.from as Address,
      chainId: cancellationResult?.chainId,
      transaction: cancelTx,
    });
    handleClose();
  };
  const handleSpeedUp = async () => {
    const speedUpResult = await sendTransaction(speedUpTransactionRequest);
    const speedUpTransaction = {
      asset: transaction?.asset,
      data: speedUpResult?.data,
      value: speedUpResult?.value,
      from: speedUpResult?.from as Address,
      to: speedUpResult?.to as Address,
      hash: speedUpResult?.hash,
      chainId: speedUpResult?.chainId,
      status: TransactionStatus.speeding_up,
      type: TransactionType.send,
      nonce: transaction?.nonce,
    };
    updateTransaction({
      address: speedUpResult?.from as Address,
      chainId: speedUpResult?.chainId,
      transaction: speedUpTransaction,
    });
    handleClose();
  };

  useEffect(() => {
    // we keep this outside of `onClose` so that global shortcuts (e.g. Escape) still clear the tx
    return () => setSelectedTransaction(); // invoke without param to remove selection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Prompt show={true} padding="12px">
      <Box
        style={{
          height: window.innerHeight - 64,
        }}
        padding="12px"
      >
        <Rows>
          <Row>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              height="full"
            >
              <Box
                style={{
                  margin: -12,
                  marginBottom: 0,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
                background="surfacePrimaryElevatedSecondary"
                display="flex"
                justifyContent="space-between"
                flexGrow="1"
                flexDirection="column"
              >
                <Box paddingTop="80px">
                  <Text weight="semibold" size="32pt" align="center">
                    {cancel ? '☠️' : '🚀'}
                  </Text>
                  <Box paddingTop="20px">
                    <Text
                      color="label"
                      size="20pt"
                      weight="bold"
                      align="center"
                    >
                      {i18n.t(
                        cancel
                          ? 'speed_up_and_cancel.cancel_title'
                          : 'speed_up_and_cancel.speed_up_title',
                      )}
                    </Text>
                  </Box>
                  <Box paddingTop="36px" justifyContent="center" display="flex">
                    <Box style={{ width: 236 }}>
                      <Text
                        size="14pt"
                        color="labelTertiary"
                        weight="medium"
                        align="center"
                      >
                        {i18n.t(
                          cancel
                            ? 'speed_up_and_cancel.cancel_explanation'
                            : 'speed_up_and_cancel.speed_up_explanation',
                        )}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Box paddingHorizontal="20px" paddingVertical="16px">
                  <TransactionFee
                    chainId={transaction?.chainId || ChainId.mainnet}
                    defaultSpeed={GasSpeed.URGENT}
                    transactionRequest={
                      cancel
                        ? cancelTransactionRequest
                        : speedUpTransactionRequest
                    }
                  />
                </Box>
              </Box>
              <Box marginHorizontal="-12px">
                <Separator />
              </Box>
              <Box style={{ height: 186 }}>
                <Rows>
                  <Row>
                    <Inset horizontal="8px">
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        paddingTop="20px"
                        style={{ height: '18px' }}
                      >
                        <Stack space="12px">
                          <Text
                            weight="semibold"
                            color="labelQuaternary"
                            size="12pt"
                          >
                            {i18n.t('speed_up_and_cancel.wallet')}
                          </Text>
                          <Inline alignVertical="center" space="4px">
                            {transaction?.to && (
                              <WalletAvatar
                                address={transaction.to}
                                size={18}
                                emojiSize="12pt"
                              />
                            )}
                            <AccountName />
                          </Inline>
                        </Stack>
                        <Stack space="12px">
                          <Text
                            weight="semibold"
                            color="labelQuaternary"
                            size="12pt"
                          >
                            {i18n.t('speed_up_and_cancel.balance')}
                          </Text>
                          {transaction && (
                            <WalletBalance transaction={transaction} />
                          )}
                        </Stack>
                      </Box>
                    </Inset>
                  </Row>
                  <Row>
                    <Box paddingTop="20px">
                      <Button
                        color={cancel ? 'red' : 'blue'}
                        height="44px"
                        variant="flat"
                        width="full"
                        onClick={cancel ? handleCancellation : handleSpeedUp}
                      >
                        <Text size="16pt" weight="bold">
                          {i18n.t(
                            cancel
                              ? 'speed_up_and_cancel.cancel_cta'
                              : 'speed_up_and_cancel.speed_up_cta',
                          )}
                        </Text>
                      </Button>
                    </Box>
                  </Row>
                  <Row>
                    <Box paddingTop="10px">
                      <Button
                        color="transparent"
                        height="44px"
                        width="full"
                        variant="transparent"
                        onClick={onClose}
                      >
                        <Text size="16pt" weight="bold">
                          {i18n.t('speed_up_and_cancel.close_cta')}
                        </Text>
                      </Button>
                    </Box>
                  </Row>
                </Rows>
              </Box>
            </Box>
          </Row>
        </Rows>
      </Box>
    </Prompt>
  );
}

function AccountName() {
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  return (
    <Box>
      <Text color="labelSecondary" size="14pt" weight="medium">
        {ensName ?? truncateAddress(address || '0x')}
      </Text>
    </Box>
  );
}

function WalletBalance({ transaction }: { transaction: RainbowTransaction }) {
  const { data: balance } = useBalance({
    addressOrName: transaction.from,
    chainId: transaction.chainId,
  });
  const displayBalance = handleSignificantDecimals(balance?.formatted || 0, 3);
  return (
    <Box paddingTop="2px">
      <Inline alignVertical="center" alignHorizontal="right">
        {balance?.symbol === 'ETH' && (
          <EthSymbol color="labelSecondary" size={12} />
        )}
        <Text color="labelSecondary" size="14pt" weight="medium">
          {displayBalance}
        </Text>
      </Inline>
    </Box>
  );
}
