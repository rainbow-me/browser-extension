import { TransactionRequest } from '@ethersproject/abstract-provider';
import { useMutation, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { type SignedAuthorizationList, isAddress, isHex } from 'viem';

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
} from '~/core/types/transactions';
import { truncateAddress } from '~/core/utils/address';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { toHex } from '~/core/utils/hex';
import { greaterThan, handleSignificantDecimals } from '~/core/utils/numbers';
import { updateTransaction } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
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
import { isLedgerConnectionError } from '../../handlers/ledger';
import { sendTransaction } from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';

const addTenPercent = (prevWeiValue = '0') =>
  new BigNumber(prevWeiValue || 0).times(110).dividedBy(100).toFixed(0);

const greaterValueInHex = (a: string, b: string) =>
  toHex(greaterThan(a, b) ? a : b);

function hasValidNonce(nonce: unknown): nonce is number {
  return typeof nonce === 'number' && Number.isInteger(nonce) && nonce >= 0;
}

function resolveReplacementTransactionFields(replaceTx: {
  from?: string;
  to?: string | null;
  hash: string;
}) {
  if (!replaceTx.from || !isAddress(replaceTx.from)) {
    throw new Error(i18n.t('errors.sending_transaction'));
  }

  const to = replaceTx.to ?? replaceTx.from;
  if (!isAddress(to) || !isHex(replaceTx.hash)) {
    throw new Error(i18n.t('errors.sending_transaction'));
  }

  return {
    from: replaceTx.from,
    to,
    hash: replaceTx.hash,
  };
}

function hasIncompleteStoredData(tx: PendingTransaction): boolean {
  const missingEssentialData =
    tx.data === '0x' || !tx.gasLimit || !hasValidNonce(tx.nonce);

  const isEip7702 =
    tx.delegation || tx.type === 'revoke_delegation' || tx.type === 'delegate';
  const needsAuthListFromChain = isEip7702 && !tx.authorizationList?.length;

  return missingEssentialData || needsAuthListFromChain;
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
> & {
  /** True when EIP-7702 (type 4) - required for speed up replacement */
  delegation?: boolean;
  /** EIP-7702 authorization list - from chain when stored tx lacked it (fallback) */
  authorizationList?: SignedAuthorizationList;
};

/** Fallback: fetches tx from chain when stored data is incomplete (e.g. external tx, or legacy tx without authorizationList). */
async function fetchPendingTransaction(
  hash: string,
  chainId: number,
): Promise<FetchedTxForReplacement | null> {
  if (!isHex(hash)) return null;

  const client = getViemClient({ chainId });
  const tx = await client.getTransaction({ hash });
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

  if (tx.type === 'eip7702') {
    return {
      ...base,
      delegation: true,
      authorizationList: tx.authorizationList,
    };
  }

  return base;
}

async function gasParamsToOverrideTransaction(
  transaction: PendingTransaction,
  selectedGasParams: TransactionGasParams | TransactionLegacyGasParams,
) {
  if ('gasPrice' in transaction && transaction.gasPrice) {
    if (!('gasPrice' in selectedGasParams)) return selectedGasParams;
    return {
      gasPrice: greaterValueInHex(
        selectedGasParams.gasPrice,
        addTenPercent(transaction.gasPrice),
      ),
    };
  }

  if (!('maxFeePerGas' in selectedGasParams)) return selectedGasParams;

  const txMaxFee = transaction.maxFeePerGas;
  const txMaxPriority = transaction.maxPriorityFeePerGas;
  if (!txMaxFee || !txMaxPriority) return selectedGasParams;

  return {
    maxFeePerGas: greaterValueInHex(
      selectedGasParams.maxFeePerGas,
      addTenPercent(txMaxFee),
    ),
    maxPriorityFeePerGas: greaterValueInHex(
      addTenPercent(txMaxPriority),
      selectedGasParams.maxPriorityFeePerGas,
    ),
  };
}

const cancelTransaction = async (
  transaction: PendingTransaction,
  selectedGasParams: TransactionGasParams | TransactionLegacyGasParams,
): Promise<TransactionRequest> => {
  const gasParams = await gasParamsToOverrideTransaction(
    transaction,
    selectedGasParams,
  );
  if (!hasValidNonce(transaction.nonce)) {
    throw new Error(i18n.t('speed_up_and_cancel.tx_confirmed_or_not_found'));
  }

  const { nonce, chainId, from } = transaction;
  return { nonce, chainId, from, to: from, value: toHex('0'), ...gasParams };
};

const speedUpTransaction = async (
  transaction: PendingTransaction,
  selectedGasParams: TransactionGasParams | TransactionLegacyGasParams,
): Promise<TransactionRequest> => {
  const gasParams = await gasParamsToOverrideTransaction(
    transaction,
    selectedGasParams,
  );
  if (!hasValidNonce(transaction.nonce)) {
    throw new Error(i18n.t('speed_up_and_cancel.tx_confirmed_or_not_found'));
  }

  const {
    data,
    chainId,
    from,
    to,
    nonce,
    gasLimit,
    value,
    delegation,
    authorizationList,
  } = transaction;
  return {
    data,
    chainId,
    from,
    to,
    nonce,
    gasLimit,
    value: toHex(value || '0'),
    ...gasParams,
    ...(delegation && { type: 4 }),
    ...(authorizationList?.length && { authorizationList }),
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
    (s) => s.selectedGas.transactionGasParams,
  );
  const cancel = currentSheet === 'cancel';

  const {
    data: transactionRequest,
    error: fetchError,
    isFetching: isFetchingTx,
  } = useQuery<TransactionRequest>({
    queryKey: [
      'speedUpCancelTxRequest',
      transaction.hash,
      transaction.chainId,
      cancel,
      selectedGasParams,
    ],
    queryFn: async () => {
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

      // EIP-7702 speed up requires authorizationList - fail early with clear message if missing
      const isEip7702 =
        resolvedTx.delegation ||
        resolvedTx.type === 'revoke_delegation' ||
        resolvedTx.type === 'delegate';
      if (!cancel && isEip7702 && !resolvedTx.authorizationList?.length) {
        throw new Error(
          i18n.t('speed_up_and_cancel.eip7702_auth_list_unavailable'),
        );
      }
      return (cancel ? cancelTransaction : speedUpTransaction)(
        resolvedTx,
        selectedGasParams,
      );
    },
    enabled: currentSheet !== 'none' && !!transaction.hash,
  });

  const { mutate: executeTransaction, isPending: sending } = useMutation({
    mutationFn: async () => {
      if (!transactionRequest) throw new Error('Transaction request not ready');
      const replaceTx = await sendTransaction(transactionRequest);
      const replacementFields = resolveReplacementTransactionFields(replaceTx);

      updateTransaction({
        address: replacementFields.from,
        chainId: replaceTx.chainId,
        transaction: {
          ...transaction,
          data: replaceTx.data,
          value: replaceTx.value?.toString(),
          from: replacementFields.from,
          to: replacementFields.to,
          hash: replacementFields.hash,
          chainId: replaceTx.chainId,
          maxFeePerGas: replaceTx.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: replaceTx.maxPriorityFeePerGas?.toString(),
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
      if (!isLedgerConnectionError(e)) {
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
                  {fetchError ? (
                    <Text size="14pt" color="red" weight="semibold">
                      {fetchError instanceof Error
                        ? fetchError.message
                        : String(fetchError)}
                    </Text>
                  ) : isFetchingTx || !transactionRequest ? (
                    <Inline
                      alignVertical="center"
                      alignHorizontal="center"
                      space="6px"
                    >
                      <Spinner size={14} color="labelTertiary" />
                      <Text size="14pt" color="labelSecondary" weight="medium">
                        {i18n.t('speed_up_and_cancel.estimating_fee')}
                      </Text>
                    </Inline>
                  ) : (
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
                        onClick={() => executeTransaction()}
                        disabled={!transactionRequest || !!fetchError}
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
