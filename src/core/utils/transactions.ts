import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getProvider } from '@wagmi/core';
import { isString } from 'lodash';
import { Address } from 'wagmi';

import { i18n } from '../languages';
import { createHttpClient } from '../network/internal/createHttpClient';
import {
  ETH_ADDRESS,
  SupportedCurrencyKey,
  WETH_ADDRESS,
  smartContractMethods,
} from '../references';
import {
  currentCurrencyStore,
  nonceStore,
  pendingTransactionsStore,
} from '../state';
import { AddressOrEth, ParsedUserAsset } from '../types/assets';
import { ChainId } from '../types/chains';
import {
  NewTransaction,
  RainbowTransaction,
  TransactionStatus,
  TransactionsApiResponse,
} from '../types/transactions';

import { parseAsset } from './assets';
import { getBlockExplorerHostForChain } from './chains';
import { convertStringToHex } from './hex';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
  convertRawAmountToDecimalFormat,
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
  tx: TransactionsApiResponse;
  currency: SupportedCurrencyKey;
  chainId: ChainId;
};

export async function parseTransaction({
  tx,
  currency,
  chainId,
}: ParseTransactionArgs): Promise<RainbowTransaction> {
  const methodName = tx.meta.action || 'method sname';
  // await fetchRegistryLookup({
  //   data: null,
  //   to: tx.address_to || null,
  //   chainId,
  //   hash: tx.hash,
  // });

  const changes = tx.changes.map(
    (change) =>
      change && {
        ...change,
        asset: parseAsset({ asset: change?.asset, currency }),
      },
  );

  const asset = changes[0]?.asset; // || (await getNativeAssetForNetwork({ chainId }));

  const {
    status,
    hash,
    address_from,
    address_to,
    meta,
    nonce,
    protocol,
    direction,
  } = tx;

  const type = meta.type || 'contract_interaction';

  const value = convertRawAmountToDecimalFormat(
    changes[0]?.value || '0',
    changes[0]?.asset.decimals,
  );

  const native = convertAmountAndPriceToNativeDisplay(
    value ?? 0,
    asset?.price?.value ?? 0,
    currency,
  );

  const _tx: RainbowTransaction = {
    description: asset?.name || methodName || 'Signed',
    from: address_from || '0x',
    to: address_to,
    name:
      meta.type === 'contract_interaction'
        ? methodName
        : asset?.name || 'Signed',
    title: i18n.t(`transactions.${type}.${status}`),
    asset,
    value,
    native,
    status,
    hash,
    chainId,
    nonce,
    protocol,
    type,
    direction,
    changes,
  };
  console.log(_tx);

  if (status === 'confirmed')
    return { ..._tx, minedAt: tx.mined_at, blockNumber: tx.block_number };

  return _tx;

  // return {
  //   // asset: parsedAsset,
  //   // balance: isL2Chain(chainId)
  //   //   ? { amount: '', display: '-' }
  //   //   : convertRawAmountToBalance(valueUnit, { decimals: 18 }),
  //   description: tx.meta.action || description || methodName || 'Signed',
  //   from: tx?.address_from as Address,
  //   hash: tx.hash,
  //   name:
  //     tx.meta.type === 'contract_interaction'
  //       ? methodName
  //       : parsedAsset?.name || 'Signed',
  //   // native: nativeDisplay,
  //   chainId,
  //   nonce: tx.nonce,
  //   protocol: tx.protocol,
  //   status: 'failed',
  //   // ...(tx.status === 'confirmed' && {
  //   //   minedAt: tx.mined_at,
  //   //   blockNumber: tx.block_number,
  //   // }),
  //   // symbol: tx.changes[0]?.asset.symbol || 'contract',
  //   title: /* tx.title ?? */ i18n.t('transactions.contract_interaction'),
  //   to: tx.address_to,
  //   type: tx.meta.type || 'contract_interaction',
  //   direction: tx.direction,
  // };
}

// const getTitle = ({
//   protocol,
//   status,
//   type,
// }: {
//   protocol?: ProtocolType;
//   status: TransactionStatus;
//   type?: TransactionType;
// }) => {
//   if (
//     protocol &&
//     (type === TransactionType.deposit || type === TransactionType.withdraw)
//   ) {
//     if (
//       status === TransactionStatus.deposited ||
//       status === TransactionStatus.withdrew ||
//       status === TransactionStatus.sent ||
//       status === TransactionStatus.received
//     ) {
//       if (protocol === ProtocolType.compound) {
//         return i18n.t('transactions.savings');
//       } else {
//         return ProtocolType?.[protocol];
//       }
//     }
//   }
//   return capitalize(status);
// };

// export const getTransactionLabel = ({
//   direction,
//   protocol,
//   status,
//   type,
// }: {
//   direction: TransactionDirection;
//   protocol: ProtocolType | undefined;
//   status: RainbowTransaction['status'];
//   type: TransactionType;
// }) => {
//   if (type === 'cancel')
//     return TransactionStatus.cancelling;

//   if (status === TransactionStatus.cancelled)
//     return TransactionStatus.cancelled;

//   if (status === TransactionStatus.speeding_up)
//     return TransactionStatus.speeding_up;

//   if (pending && type === TransactionType.purchase)
//     return TransactionStatus.purchasing;

//   const isFromAccount = direction === TransactionDirection.out;
//   const isToAccount = direction === TransactionDirection.in;
//   const isSelf = direction === TransactionDirection.self;

//   if (pending && type === TransactionType.authorize)
//     return TransactionStatus.approving;

//   if (pending && type === TransactionType.deposit) {
//     if (protocol === ProtocolType.compound) {
//       return TransactionStatus.depositing;
//     } else {
//       return TransactionStatus.sending;
//     }
//   }

//   if (pending && type === TransactionType.withdraw) {
//     if (protocol === ProtocolType.compound) {
//       return TransactionStatus.withdrawing;
//     } else {
//       return TransactionStatus.receiving;
//     }
//   }

//   if (pending && isFromAccount) return TransactionStatus.sending;
//   if (pending && isToAccount) return TransactionStatus.receiving;

//   if (status === TransactionStatus.failed) return TransactionStatus.failed;
//   if (status === TransactionStatus.dropped) return TransactionStatus.dropped;

//   if (type === TransactionType.trade && isFromAccount)
//     return TransactionStatus.swapped;

//   if (type === TransactionType.authorize) return TransactionStatus.approved;
//   if (type === TransactionType.purchase) return TransactionStatus.purchased;
//   if (type === TransactionType.cancel) return TransactionStatus.cancelled;

//   if (type === TransactionType.deposit) {
//     if (protocol === ProtocolType.compound) {
//       return TransactionStatus.deposited;
//     } else {
//       return TransactionStatus.sent;
//     }
//   }

//   if (type === TransactionType.withdraw) {
//     if (protocol === ProtocolType.compound) {
//       return TransactionStatus.withdrew;
//     } else {
//       return TransactionStatus.received;
//     }
//   }

//   if (isSelf) return TransactionStatus.sent;

//   if (type === TransactionType.execution)
//     return TransactionStatus.contract_interaction;
//   if (isFromAccount) return TransactionStatus.sent;
//   if (isToAccount) return TransactionStatus.received;

//   return TransactionStatus.unknown;
// };

export const parseNewTransaction = (
  txDetails: NewTransaction,
  nativeCurrency: SupportedCurrencyKey,
): RainbowTransaction => {
  let balance;
  const {
    amount = 0,
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
    // txTo,
    value,
    flashbots,
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
  const hash = txHash || '0x';

  const status = txStatus ?? 'pending';
  const type = txType ?? 'send';

  const title = '';
  // getTitle({
  //   protocol: protocol,
  //   status,
  //   type,
  // });

  const description = '';
  // getDescription({
  //   name: asset?.name || '',
  //   status,
  //   type,
  // });

  return {
    // address: (asset?.address ?? ETH_ADDRESS) as Address,
    asset,
    // balance,
    data,
    description,
    from,
    gasLimit,
    gasPrice,
    hash,
    maxFeePerGas,
    maxPriorityFeePerGas,
    name: asset?.name,
    // native,
    chainId,
    nonce,
    // pending: true,
    protocol,
    status,
    // symbol: asset?.symbol,
    title,
    to,
    // txTo: txTo || to,
    type,
    value,
    flashbots,
  };
};

// function getTransactionConfirmedState(
//   type?: TransactionType,
// ): TransactionStatus {
//   switch (type) {
//     case TransactionType.authorize:
//       return TransactionStatus.approved;
//     case TransactionType.deposit:
//       return TransactionStatus.deposited;
//     case TransactionType.withdraw:
//       return TransactionStatus.withdrew;
//     case TransactionType.receive:
//       return TransactionStatus.received;
//     case TransactionType.purchase:
//       return TransactionStatus.purchased;
//     default:
//       return TransactionStatus.sent;
//   }
// }

export function getPendingTransactionData({
  transaction,
  transactionStatus,
}: {
  transaction: RainbowTransaction;
  transactionStatus: TransactionStatus;
}) {
  const minedAt = Math.floor(Date.now() / 1000);
  // const title = getTitle({
  //   protocol: transaction.protocol,
  //   status: transactionStatus,
  //   type: transaction.type,
  // });
  return {
    minedAt,
    title: 'fix getPendingTransactionData',
    status: transactionStatus,
  };
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
    const transactionDirection = isSelf ? 'self' : 'out';
    const transactionStatus = 'confirmed';
    status = transactionStatus;
    // getTransactionLabel({
    //   direction: transactionDirection,
    //   pending: false,
    //   protocol: transaction?.protocol,
    //   status: transactionStatus,
    //   type: transaction?.type,
    // });
  } else if (included) {
    status = 'pending'; // TODO: prev unknown
  } else {
    status = 'failed';
  }
  return status;
}

export function getTransactionHash(tx: RainbowTransaction): string | undefined {
  return tx.hash?.split('-').shift();
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
  if (!isString(hash)) return;
  const blockExplorerHost = getBlockExplorerHostForChain(chainId);
  return `https://${blockExplorerHost}/tx/${hash}`;
}

export function getTokenBlockExplorerUrl({
  address,
  chainId,
}: {
  address: AddressOrEth;
  chainId: ChainId;
}) {
  const blockExplorerHost = getBlockExplorerHostForChain(chainId);
  return `http://${blockExplorerHost}/token/${address}`;
}

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
export const getTokenBlockExplorer = ({
  address,
  chainId,
}: Pick<ParsedUserAsset, 'address' | 'mainnetAddress' | 'chainId'>) => {
  let _address = address;
  if (_address === ETH_ADDRESS) _address = WETH_ADDRESS;
  return {
    url: getTokenBlockExplorerUrl({ address: _address, chainId }),
    name: capitalize(getBlockExplorerHostForChain(chainId).split('.').at?.(-2)),
  };
};

const flashbotsApi = createHttpClient({
  baseUrl: 'https://protect.flashbots.net',
});

type FlashbotsStatus =
  | 'PENDING'
  | 'INCLUDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNKNOWN';

export const getTransactionFlashbotStatus = async (
  transaction: RainbowTransaction,
  txHash: string,
) => {
  try {
    const fbStatus = await flashbotsApi.get<{ status: FlashbotsStatus }>(
      `/tx/${txHash}`,
    );
    const flashbotStatus = fbStatus.data.status;
    // Make sure it wasn't dropped after 25 blocks or never made it
    if (flashbotStatus === 'FAILED' || flashbotStatus === 'CANCELLED') {
      const transactionStatus = TransactionStatus.dropped;
      const minedAt = Math.floor(Date.now() / 1000);
      const title = getTitle({
        protocol: transaction.protocol,
        status: transactionStatus,
        type: transaction.type,
      });
      return { status: transactionStatus, minedAt, pending: false, title };
    }
  } catch (e) {
    //
  }
  return null;
};
