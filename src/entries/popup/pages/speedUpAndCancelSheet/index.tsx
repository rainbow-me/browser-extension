import { useMutation, useQuery } from '@tanstack/react-query';
import { Hex, isHex } from 'viem';

import { i18n } from '~/core/languages';
import { useCurrentAddressStore, useGasStore } from '~/core/state';
import { ChainId } from '~/core/types/chains';
import {
  GasSpeed,
  TransactionGasParams,
  TransactionLegacyGasParams,
} from '~/core/types/gas';
import {
  PendingTransaction,
  RainbowTransaction,
  TransactionRequest,
  TxHash,
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { handleSignificantDecimals } from '~/core/utils/numbers';
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
import { useBalance } from '~/entries/popup/hooks/useBalance';
import { useEnsName } from '~/entries/popup/hooks/useEnsName';

import { EthSymbol } from '../../components/EthSymbol/EthSymbol';
import { Spinner } from '../../components/Spinner/Spinner';
import { TransactionFee } from '../../components/TransactionFee/TransactionFee';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { isConnectionError } from '../../handlers/hardwareWallet';
import { sendTransaction } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';

const addTenPercent = (prevWeiValue = '0') =>
  (BigInt(prevWeiValue || 0) * 110n) / 100n;

const greaterValue = (a: bigint, b: bigint) => (a > b ? a : b);

function hasValidNonce(nonce: unknown): nonce is number {
  return typeof nonce === 'number' && Number.isInteger(nonce) && nonce >= 0;
}

function hasIncompleteStoredData(tx: PendingTransaction): boolean {
  return tx.data === '0x' || !tx.gasLimit || !hasValidNonce(tx.nonce);
}

/** Fields from chain needed to build speed up/cancel replacement tx */
type FetchedTxForReplacement = Pick<
  PendingTransaction,
  | 'nonce'
  | 'data'
  | 'to'
  | 'value'
  | 'gasLimit'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'from'
  | 'chainId'
>;

/** Fallback: fetches tx from chain when stored data is incomplete (e.g. external tx). */
async function fetchPendingTransaction(
  hash: string,
  chainId: number,
): Promise<FetchedTxForReplacement | null> {
  if (!isHex(hash)) return null;

  const { getViemClient } = await import('~/core/viem/clients');
  const client = getViemClient({ chainId });
  const tx = await client.getTransaction({ hash: hash as Hex });
  if (!tx || tx.blockNumber != null) return null;
  if (tx.chainId === undefined) return null;
  if (!hasValidNonce(tx.nonce)) return null;

  const to = tx.to ?? tx.from;
  const base: FetchedTxForReplacement = {
    chainId: tx.chainId,
    from: tx.from,
    to,
    nonce: tx.nonce,
    data: tx.input ?? '0x',
    value: tx.value?.toString() ?? '0',
    gasLimit: tx.gas?.toString() ?? '0',
    maxFeePerGas: tx.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
  };

  return base;
}

function gasParamsToOverrideTransaction(
  transaction: PendingTransaction,
  selectedGasParams: TransactionGasParams | TransactionLegacyGasParams,
) {
  // add 10% to the gas params of the transaction we are overriding
  // (so it executes faster than the original transaction)
  // if the selected gas params are higher than this, we use the selected gas params

  if ('gasPrice' in transaction) {
    if (!('gasPrice' in selectedGasParams)) return selectedGasParams;

    return {
      gasPrice: greaterValue(
        selectedGasParams.gasPrice,
        addTenPercent(transaction.gasPrice),
      ),
    };
  }

  if (!('maxFeePerGas' in selectedGasParams)) return selectedGasParams;

  const minMaxFeePerGas = addTenPercent(transaction.maxFeePerGas);
  const minMaxPriorityFeePerGas = addTenPercent(
    transaction.maxPriorityFeePerGas,
  );

  return {
    maxFeePerGas: greaterValue(selectedGasParams.maxFeePerGas, minMaxFeePerGas),
    maxPriorityFeePerGas: greaterValue(
      minMaxPriorityFeePerGas,
      selectedGasParams.maxPriorityFeePerGas,
    ),
  };
}

const gasParamsToBigInt = (
  gasParams: TransactionGasParams | TransactionLegacyGasParams,
): Partial<TransactionRequest> =>
  'gasPrice' in gasParams
    ? { gasPrice: BigInt(gasParams.gasPrice) }
    : {
        maxFeePerGas: BigInt(gasParams.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(gasParams.maxPriorityFeePerGas),
      };

const cancelTransaction = (
  transaction: PendingTransaction,
  selectedGasParams: TransactionGasParams | TransactionLegacyGasParams,
): TransactionRequest => {
  const gasParams = gasParamsToOverrideTransaction(
    transaction,
    selectedGasParams,
  );
  const { nonce, chainId, from } = transaction;
  return {
    nonce,
    chainId,
    from,
    to: from,
    value: 0n,
    data: undefined,
    ...gasParamsToBigInt(gasParams),
  };
};

const speedUpTransaction = (
  transaction: PendingTransaction,
  selectedGasParams: TransactionGasParams | TransactionLegacyGasParams,
): TransactionRequest => {
  const gasParams = gasParamsToOverrideTransaction(
    transaction,
    selectedGasParams,
  );
  if (!hasValidNonce(transaction.nonce)) {
    throw new Error(i18n.t('speed_up_and_cancel.tx_confirmed_or_not_found'));
  }

  const { data, chainId, from, to, nonce, gasLimit, value } = transaction;
  return {
    data: data as Hex | undefined,
    chainId,
    from,
    to,
    nonce,
    gasLimit: gasLimit ? BigInt(gasLimit) : undefined,
    value: value ? BigInt(value) : undefined,
    ...gasParamsToBigInt(gasParams),
  };
};

type SpeedUpAndCancelSheetProps = {
  currentSheet: SheetMode;
  onClose: () => void;
  transaction: PendingTransaction;
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
  const navigate = useRainbowNavigate();

  const selectedGasParams = useGasStore(
    (s) => s.selectedGas?.transactionGasParams,
  );

  const cancel = currentSheet === 'cancel';

  const { data: transactionRequestData } = useQuery<TransactionRequest>({
    queryKey: [
      'speedUpCancelTxRequest',
      transaction.hash,
      transaction.chainId,
      cancel,
      selectedGasParams,
    ],
    queryFn: async () => {
      if (!selectedGasParams) {
        throw new Error('Gas params required');
      }
      let resolvedTx = transaction;
      // Cancel only needs nonce, chainId, from - no fetch required.
      if (!cancel && hasIncompleteStoredData(transaction)) {
        const fetched = await fetchPendingTransaction(
          transaction.hash,
          transaction.chainId,
        );
        if (!fetched) {
          throw new Error(
            i18n.t('speed_up_and_cancel.tx_confirmed_or_not_found'),
          );
        }
        resolvedTx = { ...transaction, ...fetched };
      }
      if (!hasValidNonce(resolvedTx.nonce)) {
        throw new Error(
          i18n.t('speed_up_and_cancel.tx_confirmed_or_not_found'),
        );
      }

      return (cancel ? cancelTransaction : speedUpTransaction)(
        resolvedTx,
        selectedGasParams,
      );
    },
    enabled: Boolean(selectedGasParams),
  });

  const transactionRequest =
    selectedGasParams && transactionRequestData ? transactionRequestData : null;

  const { mutate: executeTransaction, isPending: sending } = useMutation({
    mutationFn: async () => {
      if (!transactionRequest || !selectedGasParams) return;
      const { hash } = await sendTransaction(transactionRequest);

      updateTransaction({
        address: transaction.from,
        chainId: transaction.chainId,
        transaction: {
          ...transaction,
          hash: hash as TxHash,
          ...('gasPrice' in selectedGasParams
            ? { gasPrice: selectedGasParams.gasPrice.toString() }
            : {
                maxFeePerGas: selectedGasParams.maxFeePerGas.toString(),
                maxPriorityFeePerGas:
                  selectedGasParams.maxPriorityFeePerGas.toString(),
              }),
          status: 'pending',
          typeOverride: cancel ? 'cancel' : 'speed_up',
          nonce: transaction.nonce,
        },
      });
    },
    onSuccess: () => {
      onClose();
      navigate(ROUTES.HOME, { state: { tab: 'activity' } });
    },
    onError: (e: Error) => {
      if (!isConnectionError(e)) {
        const extractedError = e.message.split('[')[0];
        triggerAlert({
          text: i18n.t('errors.sending_transaction'),
          description: extractedError,
        });
      }
      onClose();
      navigate('?explainer=speed_up_error');
    },
  });

  const { currentAddress: address } = useCurrentAddressStore();

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
                  {transactionRequest && (
                    <TransactionFee
                      chainId={transaction.chainId}
                      defaultSpeed={GasSpeed.URGENT}
                      transactionRequest={transactionRequest}
                    />
                  )}
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
                            align="right"
                          >
                            {i18n.t('speed_up_and_cancel.balance')}
                          </Text>
                          <WalletBalance transaction={transaction} />
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
                        onClick={executeTransaction}
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
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: ensName } = useEnsName({ address, chainId: ChainId.mainnet });
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
  if (!balance) return null;

  const displayBalance = handleSignificantDecimals(balance?.formatted || 0, 3);
  return (
    <Box paddingTop="2px">
      <Inline alignVertical="center" alignHorizontal="right" space="4px">
        {balance.symbol === 'ETH' && (
          <EthSymbol color="labelSecondary" size={12} />
        )}
        <Text color="labelSecondary" size="14pt" weight="medium">
          {displayBalance}
        </Text>
        {balance.symbol !== 'ETH' && (
          <Text color="labelSecondary" size="14pt" weight="medium">
            {balance.symbol}
          </Text>
        )}
      </Inline>
    </Box>
  );
}
