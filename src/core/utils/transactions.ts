import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getProvider } from '@wagmi/core';
import { capitalize, isString } from 'lodash';
import { Address } from 'wagmi';

import { i18n } from '../languages';
import {
  ETH_ADDRESS,
  SupportedCurrencyKey,
  smartContractMethods,
} from '../references';
import { fetchTransactions } from '../resources/transactions/transactions';
import {
  currentCurrencyStore,
  nonceStore,
  pendingTransactionsStore,
} from '../state';
import { ChainId } from '../types/chains';
import {
  NewTransaction,
  ProtocolType,
  RainbowTransaction,
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  ZerionTransaction,
  ZerionTransactionStatus,
} from '../types/transactions';

import { parseAsset } from './assets';
import { getBlockExplorerHostForChain, isL2Chain } from './chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
  convertStringToHex,
  isZero,
} from './numbers';
import { isLowerCaseMatch } from './strings';

/**
 * @desc remove hex prefix
 * @param  {String} hex
 * @return {String}
 */
const removeHexPrefix = (hex: string) => hex.toLowerCase().replace('0x', '');

/**
 * @desc pad string to specific width and padding
 * @param  {String} n
 * @param  {Number} width
 * @param  {String} z
 * @return {String}
 */
const padLeft = (n: string, width: number, z = '0') => {
  const ns = n + '';
  return ns.length >= width
    ? ns
    : new Array(width - ns.length + 1).join(z) + ns;
};

/**
 * @desc get ethereum contract call data string
 * @param  {String} func
 * @param  {Array}  arrVals
 * @return {String}
 */
const getDataString = (func: string, arrVals: string[]) => {
  let val = '';
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arrVals.length; i++) val += padLeft(arrVals[i], 64);
  const data = func + val;
  return data;
};

/**
 * @desc Generates a transaction data string for a token transfer.
 * @param value The value to transfer.
 * @param to The recipient address.
 * @return The data string for the transaction.
 */
export const getDataForTokenTransfer = (value: string, to: string): string => {
  const transferMethodHash = smartContractMethods.token_transfer.hash;
  const data = getDataString(transferMethodHash, [
    removeHexPrefix(to),
    convertStringToHex(value),
  ]);
  return data;
};

type ParseTransactionArgs = {
  tx: ZerionTransaction;
  currency: SupportedCurrencyKey;
  chainId: ChainId;
};

export function parseTransaction({
  tx,
  currency,
  chainId,
}: ParseTransactionArgs): RainbowTransaction | RainbowTransaction[] {
  if (tx.changes.length) {
    return tx.changes.map((internalTxn, index) => {
      const address = (internalTxn?.asset?.asset_code?.toLowerCase() ??
        '0x') as Address;
      const decimals = internalTxn?.asset?.decimals || 0;
      const parsedAsset = parseAsset({
        address,
        asset: internalTxn?.asset,
        currency,
      });
      const priceUnit =
        internalTxn.price ?? internalTxn?.asset?.price?.value ?? 0;
      const valueUnit: number = internalTxn?.value || 0;
      const nativeDisplay = convertRawAmountToNativeDisplay(
        valueUnit,
        decimals,
        priceUnit,
        currency,
      );

      const status = getTransactionLabel({
        direction: internalTxn.direction || tx.direction,
        pending: false,
        protocol: tx.protocol,
        status: tx.status,
        type: tx.type,
      });

      const title = getTitle({
        protocol: tx.protocol,
        status,
        type: tx.type,
      });

      const description = getDescription({
        name: parsedAsset?.name,
        status,
        type: tx.type,
      });
      return {
        address: (parsedAsset.address.toLowerCase() === ETH_ADDRESS
          ? ETH_ADDRESS
          : parsedAsset.address) as Address,
        asset: parsedAsset,
        balance: convertRawAmountToBalance(valueUnit, { decimals }),
        description,
        from: (internalTxn.address_from ?? tx.address_from) as Address,
        hash: `${tx.hash}-${index}`,
        minedAt: tx.mined_at,
        name: parsedAsset.name,
        native: nativeDisplay,
        chainId,
        nonce: tx.nonce,
        pending: false,
        protocol: tx.protocol,
        status,
        symbol: parsedAsset.symbol,
        title,
        to: (internalTxn.address_to ?? tx.address_to) as Address,
        type: tx.type,
      };
    });
  }

  return parseTransactionWithEmptyChanges({
    tx,
    currency,
    chainId,
  });
}

const parseTransactionWithEmptyChanges = ({
  tx,
  currency,
  chainId,
}: ParseTransactionArgs): RainbowTransaction => {
  const methodName = 'Signed'; // let's ask BE to grab this for us: https://github.com/rainbow-me/rainbow/blob/develop/src/handlers/transactions.ts#L79
  const updatedAsset = {
    address: ETH_ADDRESS,
    decimals: 18,
    name: 'ethereum',
    symbol: 'ETH',
  };
  const priceUnit = 0;
  const valueUnit = 0;
  const nativeDisplay = convertRawAmountToNativeDisplay(
    0,
    18,
    priceUnit,
    currency,
  );

  return {
    address: ETH_ADDRESS as Address,
    balance: isL2Chain(chainId)
      ? { amount: '', display: '-' }
      : convertRawAmountToBalance(valueUnit, updatedAsset),
    description: methodName || 'Signed',
    from: tx?.address_from as Address,
    hash: `${tx.hash}-${0}`,
    minedAt: tx.mined_at,
    name: methodName || 'Signed',
    native: nativeDisplay,
    chainId,
    nonce: tx.nonce,
    pending: false,
    protocol: tx.protocol,
    status: TransactionStatus.contract_interaction,
    symbol: 'contract',
    title: i18n.t('transactions.contract_interaction'),
    to: tx.address_to as Address,
    type: TransactionType.contract_interaction,
  };
};

export const getTitle = ({
  protocol,
  status,
  type,
}: {
  protocol?: ProtocolType;
  status: TransactionStatus;
  type?: TransactionType;
}) => {
  if (
    protocol &&
    (type === TransactionType.deposit || type === TransactionType.withdraw)
  ) {
    if (
      status === TransactionStatus.deposited ||
      status === TransactionStatus.withdrew ||
      status === TransactionStatus.sent ||
      status === TransactionStatus.received
    ) {
      if (protocol === ProtocolType.compound) {
        return i18n.t('transactions.savings');
      } else {
        return ProtocolType?.[protocol];
      }
    }
  }
  return capitalize(status);
};

export const getTransactionLabel = ({
  direction,
  pending,
  protocol,
  status,
  type,
}: {
  direction: TransactionDirection;
  pending: boolean;
  protocol: ProtocolType | undefined;
  status: ZerionTransactionStatus | TransactionStatus;
  type?: TransactionType;
}) => {
  if (status === TransactionStatus.cancelling)
    return TransactionStatus.cancelling;

  if (status === TransactionStatus.cancelled)
    return TransactionStatus.cancelled;

  if (status === TransactionStatus.speeding_up)
    return TransactionStatus.speeding_up;

  if (pending && type === TransactionType.purchase)
    return TransactionStatus.purchasing;

  const isFromAccount = direction === TransactionDirection.out;
  const isToAccount = direction === TransactionDirection.in;
  const isSelf = direction === TransactionDirection.self;

  if (pending && type === TransactionType.authorize)
    return TransactionStatus.approving;

  if (pending && type === TransactionType.deposit) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.depositing;
    } else {
      return TransactionStatus.sending;
    }
  }

  if (pending && type === TransactionType.withdraw) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.withdrawing;
    } else {
      return TransactionStatus.receiving;
    }
  }

  if (pending && isFromAccount) return TransactionStatus.sending;
  if (pending && isToAccount) return TransactionStatus.receiving;

  if (status === TransactionStatus.failed) return TransactionStatus.failed;
  if (status === TransactionStatus.dropped) return TransactionStatus.dropped;

  if (type === TransactionType.trade && isFromAccount)
    return TransactionStatus.swapped;

  if (type === TransactionType.authorize) return TransactionStatus.approved;
  if (type === TransactionType.purchase) return TransactionStatus.purchased;
  if (type === TransactionType.cancel) return TransactionStatus.cancelled;

  if (type === TransactionType.deposit) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.deposited;
    } else {
      return TransactionStatus.sent;
    }
  }

  if (type === TransactionType.withdraw) {
    if (protocol === ProtocolType.compound) {
      return TransactionStatus.withdrew;
    } else {
      return TransactionStatus.received;
    }
  }

  if (isSelf) return TransactionStatus.self;

  if (isFromAccount) return TransactionStatus.sent;
  if (isToAccount) return TransactionStatus.received;

  return TransactionStatus.unknown;
};

export const getDescription = ({
  name,
  status,
  type,
}: {
  name: string;
  status: TransactionStatus;
  type: TransactionType;
}) => {
  switch (type) {
    case TransactionType.deposit:
      return status === TransactionStatus.depositing ||
        status === TransactionStatus.sending
        ? name
        : `${i18n.t('transactions.deposited')} ${name}`;
    case TransactionType.withdraw:
      return status === TransactionStatus.withdrawing ||
        status === TransactionStatus.receiving
        ? name
        : `${i18n.t('transactions.withdrew')} ${name}`;
    default:
      return name;
  }
};

export const parseNewTransaction = (
  txDetails: NewTransaction,
  nativeCurrency: SupportedCurrencyKey,
): RainbowTransaction => {
  let balance;
  const {
    amount,
    asset,
    data,
    from,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    chainId = ChainId.mainnet,
    nonce,
    hash: txHash,
    protocol,
    status: txStatus,
    to,
    type: txType,
    txTo,
    value,
  } = txDetails;

  if (amount && asset) {
    balance = {
      amount,
      display: convertAmountToBalanceDisplay(amount, asset),
    };
  }

  const assetPrice = asset?.price?.value;

  const native = convertAmountAndPriceToNativeDisplay(
    amount ?? 0,
    assetPrice ?? 0,
    nativeCurrency,
  );
  const hash = txHash ?? `${txHash}-0`;

  const status = txStatus ?? TransactionStatus.sending;
  const type = txType ?? TransactionType.send;

  const title = getTitle({
    protocol: protocol,
    status,
    type,
  });

  const description = getDescription({
    name: asset?.name || '',
    status,
    type,
  });

  return {
    address: (asset?.address ?? ETH_ADDRESS) as Address,
    asset,
    balance,
    data,
    description,
    from,
    gasLimit,
    gasPrice,
    hash,
    maxFeePerGas,
    maxPriorityFeePerGas,
    name: asset?.name,
    native,
    chainId,
    nonce,
    pending: true,
    protocol,
    status,
    symbol: asset?.symbol,
    title,
    to,
    txTo: txTo || to,
    type,
    value,
  };
};

export function getTransactionConfirmedState(
  type?: TransactionType,
): TransactionStatus {
  switch (type) {
    case TransactionType.authorize:
      return TransactionStatus.approved;
    case TransactionType.deposit:
      return TransactionStatus.deposited;
    case TransactionType.withdraw:
      return TransactionStatus.withdrew;
    case TransactionType.receive:
      return TransactionStatus.received;
    case TransactionType.purchase:
      return TransactionStatus.purchased;
    default:
      return TransactionStatus.sent;
  }
}

export function getPendingTransactionData({
  transaction,
  transactionStatus,
}: {
  transaction: RainbowTransaction;
  transactionStatus: TransactionStatus;
}) {
  const minedAt = Math.floor(Date.now() / 1000);
  const title = getTitle({
    protocol: transaction.protocol,
    status: transactionStatus,
    type: transaction.type,
  });
  return { minedAt, title, pending: false, status: transactionStatus };
}

export async function getTransactionReceiptStatus({
  included,
  transaction,
  transactionResponse,
}: {
  included: boolean;
  transaction: RainbowTransaction;
  transactionResponse: TransactionResponse;
}) {
  let receipt;
  let status;

  try {
    if (transactionResponse) {
      receipt = await transactionResponse.wait();
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}

  status = receipt?.status || 0;
  if (!isZero(status)) {
    const isSelf = isLowerCaseMatch(
      transaction?.from || '',
      transaction?.to || '',
    );
    const transactionDirection = isSelf
      ? TransactionDirection.self
      : TransactionDirection.out;
    const transactionStatus =
      transaction.status === TransactionStatus.cancelling
        ? TransactionStatus.cancelled
        : getTransactionConfirmedState(transaction?.type);
    status = getTransactionLabel({
      direction: transactionDirection,
      pending: false,
      protocol: transaction?.protocol,
      status: transactionStatus,
      type: transaction?.type,
    });
  } else if (included) {
    status = TransactionStatus.unknown;
  } else {
    status = TransactionStatus.failed;
  }
  return status;
}

export function getTransactionHash(tx: RainbowTransaction): string | undefined {
  return tx.hash?.split('-').shift();
}

export async function watchPendingTransactions({
  address,
}: {
  address: Address;
}) {
  const { getPendingTransactions, setPendingTransactions } =
    pendingTransactionsStore.getState();
  const pendingTransactions = getPendingTransactions({
    address,
  });
  const { currentCurrency } = currentCurrencyStore.getState();

  if (!pendingTransactions?.length) return;

  const updatedPendingTransactions = await Promise.all(
    pendingTransactions.map(async (tx) => {
      let updatedTransaction = { ...tx };
      const txHash = getTransactionHash(tx);
      try {
        const chainId = tx?.chainId;
        if (chainId) {
          const provider = getProvider({ chainId });
          if (txHash) {
            const currentNonceForChainId = await provider.getTransactionCount(
              address,
              'latest',
            );
            const transactionResponse = await provider.getTransaction(txHash);
            const nonceAlreadyIncluded =
              currentNonceForChainId >
              (tx?.nonce || transactionResponse?.nonce);
            if (
              (transactionResponse?.blockNumber &&
                transactionResponse?.blockHash) ||
              nonceAlreadyIncluded
            ) {
              const latestTransactionsConfirmedByBackend =
                await fetchTransactions(
                  {
                    address,
                    chainId,
                    currency: currentCurrency,
                    transactionsLimit: 1,
                  },
                  { cacheTime: 0 },
                );
              const latest = latestTransactionsConfirmedByBackend?.[0];
              const transactionStatus = await getTransactionReceiptStatus({
                included: nonceAlreadyIncluded,
                transaction: tx,
                transactionResponse,
              });
              const pendingTransactionData = getPendingTransactionData({
                transaction: tx,
                transactionStatus,
              });

              if (latest && getTransactionHash(latest) === tx?.hash) {
                updatedTransaction = {
                  ...updatedTransaction,
                  ...latest,
                };
              } else {
                updatedTransaction = {
                  ...updatedTransaction,
                  ...pendingTransactionData,
                };
              }
            }
          }
        } else {
          throw new Error('Pending transaction missing chain id');
        }
      } catch (e) {
        console.log('ERROR WATCHING PENDING TX: ', e);
      }
      return updatedTransaction;
    }),
  );

  setPendingTransactions({
    address,
    pendingTransactions: updatedPendingTransactions.filter(
      (tx) => tx?.status !== TransactionStatus?.unknown,
    ),
  });
}

export async function getCurrentNonce({
  address,
  chainId,
}: {
  address: Address;
  chainId: ChainId;
}) {
  const { getNonce } = nonceStore.getState();
  const localNonceData = getNonce({ address, chainId });
  const localNonce = localNonceData?.currentNonce;
  const provider = getProvider({ chainId });

  const nonceIncludingPending = await provider.getTransactionCount(
    address,
    'pending',
  );
  const nonceOnChain = (nonceIncludingPending || 0) - 1;
  const currentNonce =
    (localNonce || 0) > nonceOnChain ? localNonce : nonceOnChain;

  return currentNonce;
}

export async function getNextNonce({
  address,
  chainId,
}: {
  address: Address;
  chainId: ChainId;
}) {
  const { getNonce } = nonceStore.getState();
  const localNonceData = getNonce({ address, chainId });
  const localNonce = localNonceData?.currentNonce || 0;
  const provider = getProvider({ chainId });

  const txCountIncludingPending = await provider.getTransactionCount(
    address,
    'pending',
  );
  if (!localNonce && !txCountIncludingPending) return 0;
  const ret = Math.max(localNonce + 1, txCountIncludingPending);
  return ret;
}

export async function addNewTransaction({
  address,
  chainId,
  transaction,
}: {
  address: Address;
  chainId: ChainId;
  transaction: NewTransaction;
}) {
  const { setNonce } = nonceStore.getState();
  const { getPendingTransactions, setPendingTransactions } =
    pendingTransactionsStore.getState();
  const pendingTransactions = getPendingTransactions({ address });
  const { currentCurrency } = currentCurrencyStore.getState();
  const newPendingTransaction = parseNewTransaction(
    transaction,
    currentCurrency,
  );

  setPendingTransactions({
    address,
    pendingTransactions: [newPendingTransaction, ...pendingTransactions],
  });
  setNonce({
    address,
    chainId,
    currentNonce: transaction.nonce,
  });
}

export function updateTransaction({
  address,
  chainId,
  transaction,
}: {
  address: Address;
  chainId: ChainId;
  transaction: NewTransaction;
}) {
  const { setNonce } = nonceStore.getState();
  const { getPendingTransactions, setPendingTransactions } =
    pendingTransactionsStore.getState();
  const { currentCurrency } = currentCurrencyStore.getState();
  const updatedPendingTransaction = parseNewTransaction(
    transaction,
    currentCurrency,
  );
  const pendingTransactions = getPendingTransactions({ address });
  setPendingTransactions({
    address,
    pendingTransactions: [
      { ...transaction, ...updatedPendingTransaction },
      ...pendingTransactions.filter(
        (tx) =>
          tx?.chainId !== chainId &&
          tx?.nonce !== updatedPendingTransaction?.nonce,
      ),
    ],
  });
  setNonce({
    address,
    chainId,
    currentNonce: updatedPendingTransaction?.nonce,
  });
}

export function getTransactionBlockExplorerUrl({
  hash,
  chainId,
}: {
  hash: string;
  chainId: ChainId;
}) {
  const trimmedHash = hash.replace(/-.*/g, '');
  if (!isString(hash)) return;
  const blockExplorerHost = getBlockExplorerHostForChain(chainId);
  return `https://${blockExplorerHost}/tx/${trimmedHash}`;
}
