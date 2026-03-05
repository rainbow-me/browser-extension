import { Address, isAddress, isHex } from 'viem';

import { type BatchRecord, BatchStatus, type BatchStatusValue } from './index';

export type BatchKeyParams = {
  id: `0x${string}`;
  sender: Address;
  app: string;
};

const BATCH_STATUS_VALUES = new Set<number>(
  Object.values(BatchStatus) as number[],
);

/**
 * Type guard for wallet_getCallsStatus getBatchByKey params.
 * Validates at the provider boundary before passing to the batch store.
 */
export function validateBatchKeyParams(
  params: unknown,
): params is BatchKeyParams {
  if (!params || typeof params !== 'object') return false;
  const p = params as Record<string, unknown>;
  const id = p.id;
  const sender = p.sender;
  const app = p.app;
  return (
    typeof id === 'string' &&
    isHex(id) &&
    id.startsWith('0x') &&
    typeof sender === 'string' &&
    isAddress(sender) &&
    typeof app === 'string'
  );
}

/**
 * Validates and normalizes setBatch record at the provider boundary.
 * Returns a properly typed BatchRecord when valid, null otherwise.
 */
export function validateAndNormalizeBatchRecord(
  record: unknown,
): BatchRecord | null {
  if (!record || typeof record !== 'object') return null;
  const r = record as Record<string, unknown>;
  const id = r.id;
  const sender = r.sender;
  const app = r.app;
  const chainId = r.chainId;
  const status = r.status;
  const atomic = r.atomic;
  const txHashes = r.txHashes;

  if (
    typeof id !== 'string' ||
    !isHex(id) ||
    !id.startsWith('0x') ||
    typeof sender !== 'string' ||
    !isAddress(sender) ||
    typeof app !== 'string'
  ) {
    return null;
  }

  const chainIdNum =
    typeof chainId === 'string'
      ? Number(chainId)
      : typeof chainId === 'number'
      ? chainId
      : NaN;
  if (Number.isNaN(chainIdNum) || !Number.isInteger(chainIdNum)) return null;

  if (typeof status !== 'number' || !BATCH_STATUS_VALUES.has(status)) {
    return null;
  }

  if (typeof atomic !== 'boolean') return null;

  if (!Array.isArray(txHashes)) return null;
  const validTxHashes = txHashes.every(
    (h): h is `0x${string}` =>
      typeof h === 'string' && isHex(h) && h.startsWith('0x'),
  );
  if (!validTxHashes) return null;

  return {
    id: id as `0x${string}`,
    sender: sender as Address,
    app,
    chainId: chainIdNum,
    status: status as BatchStatusValue,
    atomic,
    txHashes,
  };
}
