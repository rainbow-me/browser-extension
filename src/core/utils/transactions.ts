import { Address } from 'wagmi';

import {
  ETH_ADDRESS,
  SupportedCurrencyKey,
  smartContractMethods,
} from '../references';
import {
  getDescription,
  getTitle,
} from '../resources/transactions/transactions';
import { ChainId } from '../types/chains';
import {
  NewTransaction,
  RainbowTransaction,
  TransactionStatus,
  TransactionType,
} from '../types/transactions';

import { isL2Chain } from './chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
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

export const parseNewTransaction = (
  txDetails: NewTransaction,
  nativeCurrency: SupportedCurrencyKey,
): RainbowTransaction => {
  let balance;
  const {
    amount,
    asset,
    dappName,
    data,
    from,
    flashbots,
    ensCommitRegistrationName,
    ensRegistration,
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    chainId = ChainId.mainnet,
    nonce,
    hash: txHash,
    protocol,
    sourceAmount,
    status: txStatus,
    to,
    transferId,
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
    dappName,
    data,
    description,
    ensCommitRegistrationName,
    ensRegistration,
    flashbots,
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
    sourceAmount,
    status,
    symbol: asset?.symbol,
    title,
    to,
    transferId,
    txTo: txTo || to,
    type,
    value,
  };
};
