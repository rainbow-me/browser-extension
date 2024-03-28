import { BigNumber, FixedNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import {
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { getProvider } from '@wagmi/core';
import { isString } from 'lodash';
import { type Address } from 'viem';

import { i18n } from '../languages';
import { createHttpClient } from '../network/internal/createHttpClient';
import {
  ETH_ADDRESS,
  SupportedCurrencyKey,
  smartContractMethods,
} from '../references';
import {
  currentCurrencyStore,
  nonceStore,
  pendingTransactionsStore,
} from '../state';
import { AddressOrEth, ParsedAsset, ParsedUserAsset } from '../types/assets';
import { ChainId, ChainName } from '../types/chains';
import { UniqueAsset } from '../types/nfts';
import {
  NewTransaction,
  PaginatedTransactionsApiResponse,
  RainbowTransaction,
  TransactionApiResponse,
  TransactionDirection,
  TransactionType,
  isValidTransactionType,
  transactionTypeShouldHaveChanges,
} from '../types/transactions';

import { parseAsset, parseUserAsset, parseUserAssetBalances } from './assets';
import { getBlockExplorerHostForChain, isNativeAsset } from './chains';
import { formatNumber } from './formatNumber';
import { convertStringToHex } from './hex';
import { capitalize } from './strings';

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

export enum TokenStandard {
  ERC1155 = 'ERC1155',
  ERC721 = 'ERC721',
}

export const CRYPTO_KITTIES_NFT_ADDRESS =
  '0x06012c8cf97bead5deae237070f9587f8e7a266d';
export const CRYPTO_PUNKS_NFT_ADDRESS =
  '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';

/**
 * @desc Returns a transaction data string for an NFT transfer.
 * @param from The sender's address.
 * @param to The recipient's address.
 * @param asset The asset to transfer.
 * @return The data string if the transfer can be attempted, otherwise undefined.
 */
export const getDataForNftTransfer = (
  from: string,
  to: string,
  asset: UniqueAsset,
): string | undefined => {
  if (!asset.id || !asset.asset_contract?.address) return;
  const lowercasedContractAddress = asset.asset_contract.address.toLowerCase();
  const standard = asset.asset_contract?.schema_name;
  let data: string | undefined;
  if (
    lowercasedContractAddress === CRYPTO_KITTIES_NFT_ADDRESS &&
    asset.network === ChainName.mainnet
  ) {
    const transferMethod = smartContractMethods.token_transfer;
    data = getDataString(transferMethod.hash, [
      removeHexPrefix(to),
      convertStringToHex(asset.id),
    ]);
  } else if (
    lowercasedContractAddress === CRYPTO_PUNKS_NFT_ADDRESS &&
    asset.network === ChainName.mainnet
  ) {
    const transferMethod = smartContractMethods.punk_transfer;
    data = getDataString(transferMethod.hash, [
      removeHexPrefix(to),
      convertStringToHex(asset.id),
    ]);
  } else if (standard === TokenStandard.ERC1155) {
    const transferMethodHash =
      smartContractMethods.erc1155_safe_transfer_from.hash;
    data = getDataString(transferMethodHash, [
      removeHexPrefix(from),
      removeHexPrefix(to),
      convertStringToHex(asset.id),
      convertStringToHex('1'),
      convertStringToHex('160'),
      convertStringToHex('0'),
    ]);
  } else if (standard === TokenStandard.ERC721) {
    const transferMethod = smartContractMethods.erc721_transfer_from;
    data = getDataString(transferMethod.hash, [
      removeHexPrefix(from),
      removeHexPrefix(to),
      convertStringToHex(asset.id),
    ]);
  }
  return data;
};

type ParseTransactionArgs = {
  tx: PaginatedTransactionsApiResponse;
  currency: SupportedCurrencyKey;
  chainId: ChainId;
};

const getAssetFromChanges = (
  changes: { direction: TransactionDirection; asset: ParsedUserAsset }[],
  type: TransactionType,
) => {
  if (type === 'sale')
    return changes?.find((c) => c?.direction === 'out')?.asset;
  return changes[0]?.asset;
};

const getDescription = (
  asset: ParsedAsset | undefined,
  type: TransactionType,
  meta: PaginatedTransactionsApiResponse['meta'],
) => {
  if (asset?.type === 'nft') return asset.symbol || asset.name;
  if (type === 'cancel') return i18n.t('transactions.cancelled');

  return asset?.name || meta.action;
};

const parseFees = (
  fee: TransactionApiResponse['fee'],
  nativeAssetDecimals: number,
) => {
  const {
    gas_price,
    gas_limit,
    max_base_fee,
    max_priority_fee,
    gas_used,
    base_fee,
    type_label,
  } = fee.details || {};

  const rollupFee = BigInt(
    fee.details?.rollup_fee_details?.l1_fee || '0', // zero when it's not a rollup
  );
  const feeValue = FixedNumber.from(
    formatUnits(BigInt(fee.value) + rollupFee, nativeAssetDecimals),
  );
  const feePrice = FixedNumber.fromString(fee.price.toString());

  return {
    fee: feeValue.toString(),
    feeInNative: feeValue.mulUnsafe(feePrice).toString(),
    feeType: type_label,
    gasUsed: gas_used?.toString(),
    maxFeePerGas: max_base_fee?.toString(),
    maxPriorityFeePerGas: max_priority_fee?.toString(),
    baseFee: base_fee?.toString(),
    gasPrice: gas_price?.toString(),
    gasLimit: gas_limit?.toString(),
  };
};

export function parseTransaction({
  tx,
  currency,
  chainId,
}: ParseTransactionArgs): RainbowTransaction | undefined {
  const { status, hash, meta, nonce, protocol } = tx;

  const changes = tx.changes.filter(Boolean).map((change) => ({
    ...change,
    asset: parseUserAsset({
      asset: change.asset,
      balance: change.quantity || '0',
      currency,
    }),
    value: change.quantity || undefined,
  }));

  const type = isValidTransactionType(meta.type)
    ? meta.type
    : 'contract_interaction';

  if (
    !type ||
    (transactionTypeShouldHaveChanges(type) && changes.length === 0) ||
    !tx.address_from
  )
    return; // filters some spam or weird api responses

  const asset: RainbowTransaction['asset'] = meta.asset?.asset_code
    ? parseAsset({ asset: meta.asset, currency })
    : getAssetFromChanges(changes, type);

  const direction = tx.direction || getDirection(type);

  const description = getDescription(asset, type, meta);

  const nativeAsset = changes.find((change) => change?.asset.isNativeAsset);
  const nativeAssetPrice = FixedNumber.fromString(
    nativeAsset?.price?.toString() || '0',
  );

  const value = FixedNumber.fromValue(
    BigNumber.from(nativeAsset?.value || 0),
    nativeAsset?.asset.decimals || 0,
  );

  const valueInNative = value.mulUnsafe(nativeAssetPrice).toString();

  const nativeAssetDecimals = 18; // we only support networks with 18 decimals native assets rn, backend will change when we support more

  const { feeInNative, ...fee } = parseFees(tx.fee, nativeAssetDecimals);

  const native = {
    fee: feeInNative,
    value: valueInNative,
  };

  const contract = meta.contract_name && {
    name: meta.contract_name,
    iconUrl: meta.contract_icon_url,
  };

  return {
    from: tx.address_from,
    to: tx.address_to,
    title: i18n.t(`transactions.${type}.${status}`),
    description,
    hash,
    chainId: +chainId,
    status,
    nonce,
    protocol,
    type,
    direction,
    value: value.toString(),
    changes,
    asset,
    approvalAmount: meta.quantity,
    minedAt: tx.mined_at,
    blockNumber: tx.block_number,
    confirmations: tx.block_confirmations,
    contract,
    native,
    ...fee,
  } as RainbowTransaction;
}

export const parseNewTransaction = (
  tx: NewTransaction,
  currency: SupportedCurrencyKey,
): RainbowTransaction => {
  const changes = tx.changes?.filter(Boolean).map((change) => ({
    ...change,
    asset: parseUserAssetBalances({
      asset: change.asset,
      balance: change.value?.toString() || '0',
      currency,
    }),
  }));

  const asset = changes?.[0]?.asset || tx.asset;
  const methodName = 'Unknown method';

  return {
    ...tx,
    status: 'pending',
    data: tx.data,
    title: i18n.t(`transactions.${tx.type}.${tx.status}`),
    description: asset?.name || methodName,
    from: tx.from,
    changes,
    hash: tx.hash,
    chainId: tx.chainId,
    nonce: tx.nonce,
    protocol: tx.protocol,
    to: tx.to,
    type: tx.type,
    flashbots: tx.flashbots,
    feeType: 'maxFeePerGas' in tx ? 'eip-1559' : 'legacy',
    gasPrice: tx.gasPrice,
    maxFeePerGas: tx.maxFeePerGas,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
  } satisfies RainbowTransaction;
};

const getTransactionReceipt = async ({
  transactionResponse,
  provider,
}: {
  transactionResponse: TransactionResponse;
  provider: Provider;
}): Promise<TransactionReceipt | undefined> => {
  const receipt = await Promise.race([
    (async () => {
      try {
        if (transactionResponse.wait) {
          return await transactionResponse.wait();
        } else {
          return await provider.getTransactionReceipt(transactionResponse.hash);
        }
      } catch (e) {
        /* empty */
        return;
      }
    })(),
    new Promise((resolve) => {
      setTimeout(resolve, 1000);
    }),
  ]);
  return receipt as TransactionReceipt | undefined;
};

export async function getTransactionReceiptStatus({
  transactionResponse,
  provider,
}: {
  transactionResponse: TransactionResponse;
  provider: Provider;
}) {
  const receipt = await getTransactionReceipt({
    transactionResponse,
    provider,
  });

  if (!receipt) return { status: 'pending' as const };
  return {
    status: receipt.status === 1 ? ('confirmed' as const) : ('failed' as const),
    title:
      receipt.status === 1
        ? i18n.t('transactions.send.confirmed')
        : i18n.t('transactions.send.failed'),
    blockNumber: receipt?.blockNumber,
    minedAt: Math.floor(Date.now() / 1000),
    confirmations: receipt?.confirmations,
    gasUsed: receipt?.gasUsed.toString(),
  };
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

export function addNewTransaction({
  address,
  chainId,
  transaction,
}: {
  address: Address;
  chainId: ChainId;
  transaction: NewTransaction;
}) {
  const { setNonce } = nonceStore.getState();
  const { addPendingTransaction } = pendingTransactionsStore.getState();
  const { currentCurrency } = currentCurrencyStore.getState();
  const newPendingTransaction = parseNewTransaction(
    transaction,
    currentCurrency,
  );

  addPendingTransaction({
    address,
    pendingTransaction: newPendingTransaction,
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
  const { updatePendingTransaction } = pendingTransactionsStore.getState();
  const { currentCurrency } = currentCurrencyStore.getState();
  const updatedPendingTransaction = parseNewTransaction(
    transaction,
    currentCurrency,
  );
  updatePendingTransaction({
    address,
    pendingTransaction: updatedPendingTransaction,
  });
  setNonce({
    address,
    chainId,
    currentNonce: updatedPendingTransaction?.nonce,
  });
}

export function getTransactionBlockExplorer({
  hash,
  chainId,
  type,
}: {
  hash: string;
  chainId: ChainId;
  type?: TransactionType;
}) {
  if (!isString(hash)) return;
  const host =
    type === 'bridge' ? 'socketscan.io' : getBlockExplorerHostForChain(chainId);
  const url = `https://${host}/tx/${hash}`;
  return { name: capitalize(host?.split('.').at?.(-2)), url: url };
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

export function getBlockExplorerName(chainId: ChainId) {
  return capitalize(
    (getBlockExplorerHostForChain(chainId) || '').split('.').at?.(-2),
  );
}

export const getTokenBlockExplorer = ({
  address,
  chainId,
}: Pick<ParsedUserAsset, 'address' | 'mainnetAddress' | 'chainId'>) => {
  if (isNativeAsset(address, chainId)) return;
  return {
    url: getTokenBlockExplorerUrl({ address, chainId }),
    name: getBlockExplorerName(chainId),
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
): Promise<{
  flashbotsStatus: 'FAILED' | 'CANCELLED';
  status: 'failed';
  minedAt: number;
  title: string;
} | null> => {
  try {
    const fbStatus = await flashbotsApi.get<{ status: FlashbotsStatus }>(
      `/tx/${txHash}`,
    );
    const flashbotsStatus = fbStatus.data.status;
    // Make sure it wasn't dropped after 25 blocks or never made it
    if (flashbotsStatus === 'FAILED' || flashbotsStatus === 'CANCELLED') {
      const status = 'failed';
      const minedAt = Math.floor(Date.now() / 1000);
      const title = i18n.t(`transactions.${transaction.type}.failed`);
      return { flashbotsStatus, status, minedAt, title };
    }
  } catch (e) {
    //
  }
  return null;
};

const TransactionOutTypes = [
  'burn',
  'send',
  'deposit',
  'repay',
  'stake',
  'sale',
  'bridge',
  'bid',
  'speed_up',
  'revoke',
  'deployment',
  'contract_interaction',
] as const;

export const getDirection = (type: TransactionType) => {
  if (TransactionOutTypes.includes(type)) return 'out';
  return 'in';
};

export const getExchangeRate = ({ type, changes }: RainbowTransaction) => {
  if (type !== 'swap') return;

  const tokenIn = changes?.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes?.filter((c) => c?.direction === 'out')[0]?.asset;

  const amountIn = tokenIn?.balance.amount;
  const amountOut = tokenOut?.balance.amount;
  if (!amountIn || !amountOut) return;

  const fixedAmountIn = FixedNumber.fromString(amountIn);
  const fixedAmountOut = FixedNumber.fromString(amountOut);

  const rate = fixedAmountOut.divUnsafe(fixedAmountIn).toString();
  if (!rate) return;

  return `1 ${tokenIn.symbol} ≈ ${formatNumber(rate)} ${tokenOut.symbol}`;
};

export const getAdditionalDetails = (transaction: RainbowTransaction) => {
  const exchangeRate = getExchangeRate(transaction);
  const { asset, changes, approvalAmount, contract, type } = transaction;
  const nft = changes?.find((c) => c?.asset.type === 'nft')?.asset;
  const collection = nft?.symbol;
  const standard = nft?.standard;
  const tokenContract =
    asset?.address !== ETH_ADDRESS && asset?.address !== AddressZero
      ? asset?.address
      : undefined;

  const tokenAmount =
    !nft && !exchangeRate && tokenContract
      ? changes?.find((c) => c?.asset.address === tokenContract)?.asset.balance
          .amount
      : undefined;

  const approval = type === 'approve' &&
    approvalAmount && {
      value: approvalAmount,
      label: getApprovalLabel(transaction),
    };

  if (
    !tokenAmount &&
    !tokenContract &&
    !exchangeRate &&
    !collection &&
    !standard &&
    !approval
  )
    return;

  return {
    asset,
    tokenAmount: tokenAmount && `${formatNumber(tokenAmount)} ${asset?.symbol}`,
    tokenContract,
    contract,
    exchangeRate,
    collection,
    standard,
    approval,
  };
};

export const getApprovalLabel = ({
  approvalAmount,
  asset,
  type,
}: Pick<RainbowTransaction, 'type' | 'asset' | 'approvalAmount'>) => {
  if (!approvalAmount || !asset) return;
  if (approvalAmount === 'UNLIMITED') return i18n.t('approvals.unlimited');
  if (type === 'revoke') return i18n.t('approvals.no_allowance');
  return `${formatNumber(formatUnits(approvalAmount, asset.decimals))} ${
    asset.symbol
  }`;
};
