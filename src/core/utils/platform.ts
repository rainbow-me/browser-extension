import { Address } from 'viem';

import { AddressOrEth, AssetApiResponse } from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import type { Asset as PlatformAsset } from '~/core/types/gen/plattform/common/asset';
import type {
  BridgeableNetworkMapping,
  Transaction as PlatformTransaction,
  Asset as PlatformTransactionAsset,
  Change as PlatformTransactionChange,
  Fee as PlatformTransactionFee,
  FeeDetail as PlatformTransactionFeeDetails,
  Meta as PlatformTransactionMeta,
  RollupFeeDetails as PlatformTransactionRollupFeeDetails,
} from '~/core/types/gen/plattform/transaction/transaction';
import {
  PaginatedTransactionsApiResponse,
  TransactionApiResponse,
  TransactionDirection,
  TransactionType,
  TxHash,
  isValidTransactionType,
} from '~/core/types/transactions';

const SECONDS_IN_MILLISECOND = 1000;

const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (value === '<nil>') return 0;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return 0;
};

const toNullableNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return null;
};

const toOptionalNumber = (value?: string | number | null) => {
  const parsed = toNullableNumber(value);
  return parsed === null ? undefined : parsed;
};

const normalizeTimestamp = (value?: string | Date) => {
  if (!value) return undefined;
  if (value instanceof Date) {
    const timestamp = value.getTime();
    if (Number.isNaN(timestamp)) return undefined;
    return Math.floor(timestamp / SECONDS_IN_MILLISECOND);
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return Math.floor(timestamp / SECONDS_IN_MILLISECOND);
};

const normalizeDirection = (
  direction?: string,
): TransactionDirection | undefined => {
  if (!direction) return undefined;
  const normalized = direction.toLowerCase();
  if (normalized === 'in' || normalized === 'out' || normalized === 'self') {
    return normalized as TransactionDirection;
  }
  return undefined;
};

const normalizeTransactionType = (
  type?: string,
): TransactionType | undefined => {
  if (!type) return undefined;
  const normalized = type.toLowerCase();
  return isValidTransactionType(normalized) ? normalized : undefined;
};

const normalizeStatus = (status?: string): TransactionApiResponse['status'] => {
  if (!status) return 'pending';
  const normalized = status.toLowerCase();
  if (normalized === 'confirmed' || normalized === 'failed') {
    return normalized;
  }
  return 'pending';
};

const toOptionalAddress = (value?: string) => {
  if (!value || value.length === 0) return undefined;
  return value as Address;
};

const convertCommonNetworks = (
  networks: Record<string, { address: string; decimals: number }> | undefined,
) =>
  Object.entries(networks ?? {}).reduce<
    Record<number, { address: string; decimals: number }>
  >((acc, [key, value]) => {
    const chainId = Number(key);
    if (Number.isNaN(chainId)) {
      return acc;
    }
    acc[chainId] = {
      address: value.address,
      decimals: value.decimals,
    };
    return acc;
  }, {});

const convertCommonBridgingNetworks = (
  networks: Record<string, { bridgeable: boolean }> | undefined,
) =>
  Object.entries(networks ?? {}).reduce<
    Record<number, { bridgeable: boolean }>
  >((acc, [key, value]) => {
    const chainId = Number(key);
    if (Number.isNaN(chainId)) {
      return acc;
    }
    acc[chainId] = { bridgeable: Boolean(value?.bridgeable) };
    return acc;
  }, {});

const convertTransactionNetworks = (
  networks: PlatformTransactionAsset['networks'] | undefined,
) =>
  (networks ?? []).reduce<
    Record<number, { address: string; decimals: number }>
  >((acc, mapping) => {
    const chainId = Number(mapping.chainId);
    if (Number.isNaN(chainId) || !mapping.tokenMapping) {
      return acc;
    }
    acc[chainId] = {
      address: mapping.tokenMapping.address,
      decimals: mapping.tokenMapping.decimals,
    };
    return acc;
  }, {});

const convertTransactionBridgingNetworks = (
  networks: BridgeableNetworkMapping[] | undefined,
) =>
  (networks ?? []).reduce<Record<number, { bridgeable: boolean }>>(
    (acc, mapping) => {
      const chainId = Number(mapping.chainId);
      if (Number.isNaN(chainId) || !mapping.bridgeableNetwork) {
        return acc;
      }
      acc[chainId] = {
        bridgeable: Boolean(mapping.bridgeableNetwork.bridgeable),
      };
      return acc;
    },
    {},
  );

const convertCommonColors = (colors: PlatformAsset['colors']) =>
  colors
    ? {
        primary: colors.primary,
        fallback: colors.fallback,
        shadow: (colors as { shadow?: string }).shadow,
      }
    : undefined;

const convertTransactionColors = (
  colors: PlatformTransactionAsset['colors'],
) =>
  colors
    ? {
        primary: colors.primary,
        fallback: colors.fallback,
        shadow: colors.shadow,
      }
    : undefined;

export function convertPlatformAssetToAssetApiResponse(
  asset: PlatformAsset,
): AssetApiResponse {
  const networks = convertCommonNetworks(asset.networks);

  const bridgingNetworks = convertCommonBridgingNetworks(
    asset.bridging?.networks,
  );

  const bridgeable =
    asset.bridging?.bridgeable ??
    Object.values(bridgingNetworks).some((network) => network.bridgeable);

  const price = asset.price
    ? {
        value: toNumber(asset.price.value),
        changed_at: normalizeTimestamp(asset.price.changedAt),
        relative_change_24h: toNumber(asset.price.relativeChange24h),
      }
    : undefined;

  const colors = convertCommonColors(asset.colors);

  return {
    asset_code: asset.address as AddressOrEth,
    chain_id: asset.chainId,
    name: asset.name,
    symbol: asset.symbol,
    decimals: asset.decimals,
    icon_url: asset.iconUrl,
    type: asset.type as AssetApiResponse['type'],
    network: asset.network as ChainName | undefined,
    colors,
    price,
    networks: networks as AssetApiResponse['networks'],
    bridging: {
      bridgeable,
      networks: bridgingNetworks as AssetApiResponse['bridging']['networks'],
    },
    transferable: asset.transferable,
  } as AssetApiResponse;
}

const convertPlatformTransactionAssetToAssetApiResponse = (
  asset: PlatformTransactionAsset | undefined,
): AssetApiResponse | undefined => {
  if (!asset) return undefined;

  const chainId = Number(asset.chainId);
  const parsedChainId = Number.isNaN(chainId) ? 0 : chainId;

  const networks = convertTransactionNetworks(asset.networks);
  const bridgingNetworks = convertTransactionBridgingNetworks(
    asset.bridging?.networks,
  );

  const bridgeable =
    asset.bridging?.bridgeable ??
    Object.values(bridgingNetworks).some((network) => network.bridgeable);

  const price = asset.price
    ? {
        value: toNumber(asset.price.value),
        changed_at: normalizeTimestamp(asset.price.changedAt),
        relative_change_24h: toNumber(asset.price.relativeChange24h),
      }
    : undefined;

  const colors = convertTransactionColors(asset.colors);
  const transferable =
    asset.hasTransferable === true ? asset.transferable : undefined;

  return {
    asset_code: asset.assetCode as AddressOrEth,
    chain_id: parsedChainId,
    name: asset.name,
    symbol: asset.symbol,
    decimals: asset.decimals,
    icon_url: asset.iconUrl,
    type: asset.type as AssetApiResponse['type'],
    network: asset.network as ChainName | undefined,
    colors,
    price,
    networks: networks as AssetApiResponse['networks'],
    bridging: {
      bridgeable,
      networks: bridgingNetworks as AssetApiResponse['bridging']['networks'],
    },
    transferable,
  } as AssetApiResponse;
};

const convertPlatformChange = (
  change: PlatformTransactionChange,
): TransactionApiResponse['changes'][number] => {
  const asset = convertPlatformTransactionAssetToAssetApiResponse(change.asset);
  const direction = normalizeDirection(change.direction);
  const addressFrom = toOptionalAddress(change.addressFrom);
  const addressTo = toOptionalAddress(change.addressTo);

  if (!asset || !direction || !addressFrom || !addressTo) {
    return undefined;
  }

  return {
    asset,
    value: toNullableNumber(change.value),
    quantity: change.quantity ?? '0',
    direction,
    address_from: addressFrom,
    address_to: addressTo,
    price: toNumber(change.price),
  };
};

const convertPlatformRollupDetails = (
  details: PlatformTransactionRollupFeeDetails | undefined,
) => {
  if (!details) return undefined;

  return {
    l1_fee: toNumber(details.l1Fee),
    l1_fee_scalar: toNumber(details.l1FeeScalar),
    l1_gas_price: toNumber(details.l1GasPrice),
    l1_gas_used: toNumber(details.l1GasUsed),
    l2_fee: toNumber(details.l2Fee),
  };
};

const convertPlatformFeeDetails = (
  details: PlatformTransactionFeeDetails | undefined,
): TransactionApiResponse['fee']['details'] | undefined => {
  if (!details) return undefined;

  const typeValue = toNumber(details.type);
  if (typeValue !== 0 && typeValue !== 2) {
    return undefined;
  }

  const rollupDetails = convertPlatformRollupDetails(
    details.rollupFeeDetails,
  ) ?? {
    l1_fee: 0,
    l1_fee_scalar: 0,
    l1_gas_price: 0,
    l1_gas_used: 0,
    l2_fee: 0,
  };

  const typeLabel =
    details.typeLabel?.toLowerCase() === 'eip-1559' ? 'eip-1559' : 'legacy';

  return {
    type: typeValue,
    type_label: typeLabel,
    gas_price: toNumber(details.gasPrice),
    gas_limit: toNumber(details.gasLimit),
    gas_used: toNumber(details.gasUsed),
    max_fee: toNumber(details.maxFee),
    max_priority_fee: toNumber(details.maxPriorityFee),
    base_fee: toNumber(details.baseFee),
    max_base_fee: toNumber(details.maxBaseFee),
    rollup_fee_details: rollupDetails,
  };
};

const convertPlatformFee = (
  fee: PlatformTransactionFee | undefined,
): TransactionApiResponse['fee'] => {
  if (!fee) {
    return {
      value: 0,
      price: 0,
    };
  }

  const details = convertPlatformFeeDetails(fee.details);

  return {
    value: toNumber(fee.value),
    price: toNumber(fee.price),
    ...(details ? { details } : {}),
  };
};

const convertPlatformMeta = (
  meta: PlatformTransactionMeta | undefined,
  fallbackStatus: string,
  fallbackType?: string,
): TransactionApiResponse['meta'] => {
  const asset = convertPlatformTransactionAssetToAssetApiResponse(meta?.asset);
  const quantity =
    meta?.quantity && meta.quantity.length > 0
      ? (meta.quantity as TransactionApiResponse['meta']['quantity'])
      : undefined;

  const type = normalizeTransactionType(meta?.type ?? fallbackType);

  const externalSubtypeSource = [meta?.publicSubType, meta?.subType].map(
    (value) => value?.toLowerCase(),
  );
  const externalSubtype = externalSubtypeSource.includes('rewards_claim')
    ? 'rewards_claim'
    : undefined;

  return {
    approval_to: toOptionalAddress(meta?.approvalTo),
    contract_name: meta?.contractName || undefined,
    contract_icon_url: meta?.contractIconUrl || undefined,
    explorer_label: meta?.explorerLabel || undefined,
    explorer_url: meta?.explorerUrl || undefined,
    type,
    action: meta?.action || undefined,
    asset,
    quantity,
    status: normalizeStatus(fallbackStatus),
    external_subtype: externalSubtype,
  };
};

export function convertPlatformTransactionToApiResponse(
  transaction: PlatformTransaction,
): TransactionApiResponse {
  const changes = (transaction.changes ?? []).map(convertPlatformChange);

  return {
    status: normalizeStatus(transaction.status),
    id: transaction.id as TxHash,
    hash: transaction.hash as TxHash,
    network: transaction.network as ChainName,
    protocol: undefined,
    direction: normalizeDirection(transaction.direction),
    address_from: toOptionalAddress(transaction.addressFrom),
    address_to: toOptionalAddress(transaction.addressTo),
    nonce: transaction.nonce !== undefined ? Number(transaction.nonce) : -2,
    changes,
    fee: convertPlatformFee(transaction.fee),
    block_confirmations: toOptionalNumber(transaction.blockConfirmations),
    meta: convertPlatformMeta(
      transaction.meta,
      transaction.status,
      transaction.type,
    ),
    block_number: toOptionalNumber(transaction.blockNumber),
    mined_at: normalizeTimestamp(transaction.minedAt),
  };
}

export function convertPlatformTransactionToPaginatedApiResponse(
  transaction: PlatformTransaction,
): PaginatedTransactionsApiResponse {
  const { fee, ...rest } = convertPlatformTransactionToApiResponse(transaction);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { details, ...feeWithoutDetails } = fee;
  return {
    ...rest,
    fee: feeWithoutDetails,
  };
}
