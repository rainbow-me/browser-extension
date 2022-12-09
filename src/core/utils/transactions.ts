import { capitalize } from 'lodash';
import { Address } from 'wagmi';

import { i18n } from '../languages';
import {
  ETH_ADDRESS,
  SupportedCurrencyKey,
  smartContractMethods,
} from '../references';
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
import { isL2Chain } from './chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
  convertRawAmountToBalance,
  convertRawAmountToNativeDisplay,
  convertStringToHex,
} from './numbers';

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
        native: isL2Chain(chainId)
          ? { amount: '', display: '' }
          : nativeDisplay,
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

  const native =
    chainId && isL2Chain(chainId)
      ? { amount: '', display: '' }
      : convertAmountAndPriceToNativeDisplay(
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
