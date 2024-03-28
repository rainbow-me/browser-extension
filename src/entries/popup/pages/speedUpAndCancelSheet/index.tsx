import { TransactionRequest } from '@ethersproject/abstract-provider';
import BigNumber from 'bignumber.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  NewTransaction,
  RainbowTransaction,
  TxHash,
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { toHex } from '~/core/utils/hex';
import { greaterThan, handleSignificantDecimals } from '~/core/utils/numbers';
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
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { RainbowError, logger } from '~/logger';

import { EthSymbol } from '../../components/EthSymbol/EthSymbol';
import { Spinner } from '../../components/Spinner/Spinner';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { isLedgerConnectionError } from '../../handlers/ledger';
import { sendTransaction } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';

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
  transaction: RainbowTransaction;
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
  const [sending, setSending] = useState(false);

  const navigate = useRainbowNavigate();

  const { data: transactionResponse } = useTransaction({
    chainId: transaction?.chainId,
    hash: transaction?.hash,
  });
  const cancel = currentSheet === 'cancel';

  const onExecuteTransaction = () => {
    if (cancel) handleCancellation();
    else handleSpeedUp();

    onClose();
    navigate(ROUTES.HOME, { state: { tab: 'activity' } });
  };

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
      value: toHex(transaction?.value || ''),
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
    setSending(true);
    try {
      const cancellationResult = await sendTransaction(
        cancelTransactionRequest,
      );
      const cancelTx = {
        ...transaction,
        data: cancellationResult?.data,
        value: cancellationResult?.value?.toString(),
        from: cancellationResult?.from as Address,
        to: cancellationResult?.from as Address,
        hash: cancellationResult?.hash as TxHash,
        chainId: cancelTransactionRequest?.chainId as ChainId,
        status: 'pending',
        type: 'cancel',
        nonce: transaction?.nonce,
      } satisfies NewTransaction;
      updateTransaction({
        address: cancellationResult?.from as Address,
        chainId: cancellationResult?.chainId,
        transaction: cancelTx,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (!isLedgerConnectionError(e)) {
        const extractedError = (e as Error).message.split('[')[0];
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      }
      logger.error(new RainbowError('send: error speed up tx'), {
        message: (e as Error)?.message,
      });
    } finally {
      setSending(false);
    }
  };
  const handleSpeedUp = async () => {
    try {
      setSending(true);
      const speedUpResult = await sendTransaction(speedUpTransactionRequest);
      const speedUpTransaction = {
        ...transaction,
        data: speedUpResult?.data,
        value: speedUpResult?.value?.toString(),
        from: speedUpResult?.from as Address,
        to: speedUpResult?.to as Address,
        hash: speedUpResult?.hash as TxHash,
        chainId: speedUpResult?.chainId,
        status: 'pending',
        type: 'speed_up',
        nonce: transaction?.nonce,
      } satisfies NewTransaction;
      updateTransaction({
        address: speedUpResult?.from as Address,
        chainId: speedUpResult?.chainId,
        transaction: speedUpTransaction,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (!isLedgerConnectionError(e)) {
        const extractedError = (e as Error).message.split('[')[0];
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      }
      logger.error(new RainbowError('send: error cancel tx'), {
        message: (e as Error)?.message,
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // we keep this outside of `onClose` so that global shortcuts (e.g. Escape) still clear the tx
    return () => {
      setSelectedTransaction();
    }; // invoke without param to remove selection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { address } = useAccount();

  return (
    <Prompt
      zIndex={zIndexes.SPEED_UP_CANCEL_PROMPT}
      show={currentSheet !== 'none'}
      padding="12px"
      handleClose={onClose}
      borderRadius="24px"
      background="surfacePrimaryElevated"
    >
      <Box
        style={{
          height: window.innerHeight - 64,
          maxHeight: POPUP_DIMENSIONS.height - 64,
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
                <Stack paddingTop="68px" gap="20px" alignItems="center">
                  <Text weight="semibold" size="32pt" align="center">
                    {cancel ? '☠️' : '🚀'}
                  </Text>
                  <Text color="label" size="20pt" weight="bold" align="center">
                    {i18n.t(
                      cancel
                        ? 'speed_up_and_cancel.cancel_title'
                        : 'speed_up_and_cancel.speed_up_title',
                    )}
                  </Text>
                  <Separator width={102} color="separatorTertiary" />
                  <Box justifyContent="center" display="flex">
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
                </Stack>
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
                <Separator color="separatorSecondary" />
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
                            <WalletAvatar
                              addressOrName={address}
                              size={18}
                              emojiSize="12pt"
                            />
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
                        onClick={onExecuteTransaction}
                      >
                        {sending ? (
                          <Box
                            width="fit"
                            alignItems="center"
                            justifyContent="center"
                            style={{ margin: 'auto' }}
                          >
                            <Spinner size={16} color="label" />
                          </Box>
                        ) : (
                          <Text size="16pt" weight="bold">
                            {i18n.t(
                              cancel
                                ? 'speed_up_and_cancel.cancel_cta'
                                : 'speed_up_and_cancel.speed_up_cta',
                            )}
                          </Text>
                        )}
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
    address: transaction.from,
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
