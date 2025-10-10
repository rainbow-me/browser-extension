import { Address } from 'viem';

import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  isValidTransactionType,
} from '~/core/types/transactions';

const SECONDS_IN_MILLISECOND = 1000;

export const toNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (value === '<nil>') return 0;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return 0;
};

export const toNullableNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) return Number(value);
  return null;
};

export const toOptionalNumber = (value?: string | number | null) => {
  const parsed = toNullableNumber(value);
  return parsed === null ? undefined : parsed;
};

export const toBigInt = (value?: string | number | bigint | null) => {
  if (value === null || value === undefined) return 0n;
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) return 0n;
    return BigInt(Math.trunc(value));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '<nil>') return 0n;
    try {
      return BigInt(trimmed);
    } catch (error) {
      return 0n;
    }
  }
  return 0n;
};

export const normalizeTimestamp = (value?: string | Date) => {
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

export const normalizeDirection = (
  direction?: string,
): TransactionDirection | undefined => {
  if (!direction) return undefined;
  const normalized = direction.toLowerCase();
  if (normalized === 'in' || normalized === 'out' || normalized === 'self') {
    return normalized as TransactionDirection;
  }
  return undefined;
};

export const normalizeTransactionType = (
  type?: string,
): TransactionType | undefined => {
  if (!type) return undefined;
  const normalized = type.toLowerCase();
  return isValidTransactionType(normalized) ? normalized : undefined;
};

export const normalizeStatus = (status?: string): TransactionStatus => {
  if (!status) return 'pending';
  const normalized = status.toLowerCase();
  if (normalized === 'confirmed' || normalized === 'failed') {
    return normalized;
  }
  return 'pending';
};

export const toOptionalAddress = (value?: string) => {
  if (!value || value.length === 0) return undefined;
  return value as Address;
};
