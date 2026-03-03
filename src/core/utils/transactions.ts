import { isString } from 'lodash';
import {
  Address,
  Hex,
  PublicClient,
  encodeFunctionData,
  erc20Abi,
  erc721Abi,
  formatUnits,
  parseAbi,
  zeroAddress,
} from 'viem';

import RainbowIcon from 'static/images/icon-16@2x.png';
import { useNetworkStore } from '~/core/state/networks/networks';

import { i18n } from '../languages';
import { ETH_ADDRESS, SupportedCurrencyKey } from '../references';
import {
  useCurrentCurrencyStore,
  useNonceStore,
  usePendingTransactionsStore,
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
import { getViemClient } from '../viem/clients';

import { parseAsset, parseUserAsset, parseUserAssetBalances } from './assets';
import { getBlockExplorerHostForChain, isNativeAsset } from './chains';
import { formatNumber } from './formatNumber';
import { divide } from './numbers';
import { capitalize } from './strings';

const cryptoPunksAbi = parseAbi([
  'function transferPunk(address to, uint256 punkIndex)',
]);
const erc1155Abi = parseAbi([
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
]);

const CRYPTO_KITTIES_NFT_ADDRESS = '0x06012c8cf97bead5deae237070f9587f8e7a266d';
const CRYPTO_PUNKS_NFT_ADDRESS = '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb';

export const getDataForTokenTransfer = (value: bigint, to: Address): Hex =>
  encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [to, value],
  });

export const getDataForNftTransfer = (
  from: string,
  to: string,
  asset: UniqueAsset,
): string | undefined => {
  if (!asset.id || !asset.asset_contract?.address) return;
  const contract = asset.asset_contract.address.toLowerCase();
  const standard = asset.asset_contract?.schema_name;

  if (
    contract === CRYPTO_KITTIES_NFT_ADDRESS &&
    asset.network === ChainName.mainnet
  ) {
    return encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to as Address, BigInt(asset.id)],
    });
  }
  if (
    contract === CRYPTO_PUNKS_NFT_ADDRESS &&
    asset.network === ChainName.mainnet
  ) {
    return encodeFunctionData({
      abi: cryptoPunksAbi,
      functionName: 'transferPunk',
      args: [to as Address, BigInt(asset.id)],
    });
  }
  if (standard === 'ERC1155') {
    return encodeFunctionData({
      abi: erc1155Abi,
      functionName: 'safeTransferFrom',
      args: [from as Address, to as Address, BigInt(asset.id), 1n, '0x'],
    });
  }
  if (standard === 'ERC721') {
    return encodeFunctionData({
      abi: erc721Abi,
      functionName: 'transferFrom',
      args: [from as Address, to as Address, BigInt(asset.id)],
    });
  }
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

const getAddressTo = (tx: PaginatedTransactionsApiResponse) => {
  switch (tx.meta.type) {
    case 'approve':
      return tx.meta.approval_to;
    case 'sale':
      return tx.changes.find((c) => c?.direction === 'out')?.address_to;
    case 'receive':
    case 'airdrop':
      return tx.changes[0]?.address_to;
    default:
      return tx.address_to;
  }
};

type NonNullish<T> = T extends null | undefined ? never : T;

function getSwapChanges(changes: RainbowTransaction['changes']) {
  const nonNftChanges = changes?.filter(
    (c): c is NonNullish<typeof c> => !!c?.asset && c.asset.type !== 'nft',
  );
  // No need to be exactly two, this is how App is handling it, simply showing thee first occurrence.While this is not perfect, I think it's better than the default of just showing one symbol, so we'll do it the same way.
  // if (nonNftChanges?.length !== 2) return;
  if (!nonNftChanges) return;
  const inChange = nonNftChanges.find((c) => c?.direction === 'in');
  const outChange = nonNftChanges.find((c) => c?.direction === 'out');
  if (!inChange || !outChange) return;
  return {
    in: inChange,
    out: outChange,
  };
}
function getNftDescription(
  {
    name,
    symbol,
  }: {
    name?: string;
    symbol?: string;
  },
  type: TransactionType,
) {
  // This would show stuff like 'NFT: #363', which doesn't look good right now. This should be used to show which NFT (name?) in which collection (symbol?) was interacted with.
  // if (name && symbol) return `${symbol}: ${name}`;

  // For whatever reason, App shows the symbol for NFTs if it's a receive, but if it's a mint or any other it shows the name. While I dont think this makes sense, we'll do the same for now to match App, but I think the longterm solution is above, to show collection name and NFT name together.
  if (type === 'receive') return symbol;

  if (name) return name;
  if (symbol) return symbol;
  return 'Unknown NFT';
}

const getDescription = (
  asset: ParsedAsset | undefined,
  type: TransactionType,
  changes: RainbowTransaction['changes'],
  meta: Pick<
    PaginatedTransactionsApiResponse['meta'],
    'contract_name' | 'action'
  > = {},
) => {
  if (asset?.type === 'nft') return getNftDescription(asset, type);
  if (type === 'cancel') return i18n.t('transactions.cancelled');
  if (type === 'approve' && !asset?.name && meta.contract_name)
    // this catches a backend bug, where they dont return the asset object inside the meta, which would lead to asset in this function to be null on approvals. In these cases, we can do a slightly better job than showing `meta.action` which is "Approval", instead we can show the contract name. The badge ontop of the description ("Approved") will make sure the user knows that they approved something, so goal of the description in this case is to let the user know what they approved.
    return meta.contract_name;

  if (type === 'swap') {
    const swapChanges = getSwapChanges(changes);
    if (swapChanges) {
      return `${swapChanges.out.asset.symbol} → ${swapChanges.in.asset.symbol}`;
    }
  }

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

  const rollupFee = BigInt(fee.details?.rollup_fee_details?.l1_fee || '0');
  const feeValue = Number(
    formatUnits(BigInt(fee.value) + rollupFee, nativeAssetDecimals),
  );
  const feePrice = fee.price;

  return {
    fee: feeValue.toString(),
    feeInNative: (feeValue * feePrice).toString(),
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

  const changes = (tx.changes ?? []).filter(Boolean).map((change) => ({
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
    !tx.address_from ||
    (status !== 'failed' && // failed txs won't have changes
      transactionTypeShouldHaveChanges(type) &&
      changes.length === 0)
  )
    return; // filters some spam or weird api responses

  // Use primary asset from transaction if available, otherwise determine the asset from the changes
  const asset: RainbowTransaction['asset'] = meta.asset
    ? parseAsset({ asset: meta.asset, currency })
    : getAssetFromChanges(changes, type);

  const addressTo = getAddressTo(tx);

  const direction = getDirection(type, changes, tx.direction);

  const description = getDescription(asset, type, changes, meta);

  const nativeAsset = changes.find((change) => change?.asset.isNativeAsset);

  const decimals = nativeAsset?.asset.decimals || 0;
  const valueNum = Number(
    formatUnits(BigInt(nativeAsset?.value || 0), decimals),
  );

  const nativeAssetDecimals = 18; // we only support networks with 18 decimals native assets rn, backend will change when we support more

  const nativeAssetPrice =
    typeof nativeAsset?.price === 'number' ? nativeAsset.price : 0;

  const valueInNative = (valueNum * nativeAssetPrice).toString();

  const { feeInNative, ...fee } = parseFees(tx.fee, nativeAssetDecimals);

  const native = {
    fee: feeInNative,
    value: valueInNative,
  };

  let contract;
  if (meta.contract_name) {
    if (meta.external_subtype === 'rewards_claim') {
      contract = {
        name: 'Rainbow',
        iconUrl: RainbowIcon,
      };
    } else {
      contract = {
        name: meta.contract_name,
        iconUrl: meta.contract_icon_url,
      };
    }
  }

  const explorer = meta.explorer_label &&
    meta.explorer_url && {
      name: meta.explorer_label,
      url: meta.explorer_url,
    };

  return {
    from: tx.address_from,
    to: addressTo,
    title: i18n.t(`transactions.${type}.${status}`),
    description,
    hash,
    chainId: +chainId,
    status,
    nonce,
    protocol,
    type,
    direction,
    value: valueNum.toString(),
    changes,
    asset,
    approvalAmount: meta.quantity,
    minedAt: tx.mined_at,
    blockNumber: tx.block_number,
    confirmations: tx.block_confirmations,
    contract,
    native,
    explorer,
    ...fee,
  } as RainbowTransaction;
}

const parseNewTransaction = (
  tx: NewTransaction,
  currency: SupportedCurrencyKey,
): RainbowTransaction => {
  const changes = tx.changes?.filter(Boolean).map((change) => ({
    ...change,
    asset: parseUserAssetBalances({
      asset: change.asset,
      balance: change.value?.toString() ?? '0',
      currency,
    }),
  }));

  const asset = changes?.[0]?.asset || tx.asset;
  const methodName = 'Unknown method';

  return {
    ...tx,
    status: 'pending',
    data: tx.data,
    title: i18n.t(`transactions.${tx.typeOverride || tx.type}.${tx.status}`),
    description:
      tx.description ||
      getDescription(asset, tx.type, changes, { action: methodName }),
    from: tx.from,
    changes,
    hash: tx.hash,
    chainId: tx.chainId,
    lastSubmittedTimestamp: Date.now(),
    nonce: tx.nonce,
    protocol: tx.protocol,
    to: tx.to,
    type: tx.type,
    feeType: 'maxFeePerGas' in tx ? 'eip-1559' : 'legacy',
    gasPrice: tx.gasPrice,
    maxFeePerGas: tx.maxFeePerGas,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
  } satisfies RainbowTransaction;
};

export async function getTransactionReceiptStatus({
  hash,
  client,
}: {
  hash: Hex;
  client: PublicClient;
}) {
  const receipt = await Promise.race([
    (async () => {
      try {
        return await client.getTransactionReceipt({ hash });
      } catch {
        return undefined;
      }
    })(),
    new Promise<undefined>((resolve) => {
      setTimeout(resolve, 1000);
    }),
  ]);

  if (!receipt) return { status: 'pending' as const };
  return {
    status:
      receipt.status === 'success'
        ? ('confirmed' as const)
        : ('failed' as const),
    title:
      receipt.status === 'success'
        ? i18n.t('transactions.send.confirmed')
        : i18n.t('transactions.send.failed'),
    blockNumber: Number(receipt.blockNumber),
    minedAt: Math.floor(Date.now() / 1000),
    confirmations: 1,
    gasUsed: receipt.gasUsed.toString(),
  };
}

export async function getNextNonce({
  address,
  chainId,
}: {
  address: Address;
  chainId: ChainId;
}) {
  const { getNonce } = useNonceStore.getState();
  const localNonceData = getNonce({ address, chainId });
  const localNonce = localNonceData?.currentNonce || -1;
  const client = getViemClient({ chainId });
  const privateMempoolTimeout = useNetworkStore
    .getState()
    .getChainsPrivateMempoolTimeout()[chainId];

  const pendingTxCountRequest = client.getTransactionCount({
    address,
    blockTag: 'pending',
  });
  const latestTxCountRequest = client.getTransactionCount({
    address,
    blockTag: 'latest',
  });
  const [pendingTxCountFromPublicRpc, latestTxCountFromPublicRpc] =
    await Promise.all([pendingTxCountRequest, latestTxCountRequest]);

  const numPendingPublicTx =
    pendingTxCountFromPublicRpc - latestTxCountFromPublicRpc;
  const numPendingLocalTx = Math.max(
    localNonce + 1 - latestTxCountFromPublicRpc,
    0,
  );
  if (numPendingLocalTx === numPendingPublicTx)
    return pendingTxCountFromPublicRpc; // nothing in private mempool, proceed normally
  if (numPendingLocalTx === 0 && numPendingPublicTx > 0)
    return latestTxCountFromPublicRpc; // catch up with public

  const { pendingTransactions: storePendingTransactions } =
    usePendingTransactionsStore.getState();
  const pendingTransactions: RainbowTransaction[] =
    storePendingTransactions[address]?.filter(
      (txn) => txn.chainId === chainId,
    ) || [];

  let nextNonce = localNonce + 1;
  for (const pendingTx of pendingTransactions) {
    if (!pendingTx.nonce || pendingTx.nonce < pendingTxCountFromPublicRpc) {
      continue;
    } else {
      if (!pendingTx.lastSubmittedTimestamp) continue;
      if (pendingTx.nonce === pendingTxCountFromPublicRpc) {
        if (
          Date.now() - pendingTx.lastSubmittedTimestamp >
          privateMempoolTimeout
        ) {
          nextNonce = pendingTxCountFromPublicRpc;
          break;
        } else {
          nextNonce = localNonce + 1;
          break;
        }
      } else {
        nextNonce = pendingTxCountFromPublicRpc;
        break;
      }
    }
  }
  return nextNonce;
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
  updateTransaction({
    address,
    chainId,
    transaction,
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
  const { getNonce, setNonce } = useNonceStore.getState();
  const { updatePendingTransaction } = usePendingTransactionsStore.getState();
  const { currentCurrency } = useCurrentCurrencyStore.getState();
  const updatedPendingTransaction = parseNewTransaction(
    transaction,
    currentCurrency,
  );
  updatePendingTransaction({
    address,
    pendingTransaction: updatedPendingTransaction,
  });
  const localNonceData = getNonce({ address, chainId });
  const localNonce = localNonceData?.currentNonce || -1;
  if (transaction.nonce > localNonce) {
    setNonce({
      address,
      chainId,
      currentNonce: updatedPendingTransaction?.nonce,
    });
  }
}

export const isType4Transaction = (tx: {
  delegation?: boolean;
  type?: string;
}): boolean =>
  !!tx.delegation || tx.type === 'revoke_delegation' || tx.type === 'delegate';

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

const getDirection = (
  type: TransactionType,
  changes: RainbowTransaction['changes'],
  txDirection?: TransactionDirection,
) => {
  if (type !== 'airdrop' && txDirection) return txDirection;
  if (changes?.length === 1) return changes[0]?.direction;
  if (TransactionOutTypes.includes(type)) return 'out';
  return 'in';
};

const getExchangeRate = ({ type, changes }: RainbowTransaction) => {
  if (type !== 'swap') return;

  const tokenIn = changes?.filter((c) => c?.direction === 'in')[0]?.asset;
  const tokenOut = changes?.filter((c) => c?.direction === 'out')[0]?.asset;

  const amountIn = tokenIn?.balance.amount;
  const amountOut = tokenOut?.balance.amount;
  if (!amountIn || !amountOut) return;

  const rate = divide(amountOut, amountIn);
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
    asset?.address !== ETH_ADDRESS && asset?.address !== zeroAddress
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
    !approval &&
    contract?.name !== 'Rainbow'
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
  return `${formatNumber(
    formatUnits(BigInt(approvalAmount), asset.decimals),
  )} ${asset.symbol}`;
};
