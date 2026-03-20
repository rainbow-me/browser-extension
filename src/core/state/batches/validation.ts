import { type Address, isAddress } from 'viem';

import { type BatchRecord, BatchStatus } from './index';

export type BatchKeyParams = {
  id: string;
  sender: Address;
  app: string;
};

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
    typeof sender === 'string' &&
    isAddress(sender) &&
    typeof app === 'string'
  );
}

/**
 * Validates and normalizes a setBatch record from the provider boundary.
 * The provider sends BatchRecordBase — we add nonces: [] and status: Pending.
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
  const atomic = r.atomic;

  if (
    typeof id !== 'string' ||
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

  if (typeof atomic !== 'boolean') return null;

  return {
    id,
    sender: sender as Address,
    app,
    chainId: chainIdNum,
    status: BatchStatus.Pending,
    atomic,
    nonces: [],
    createdAt: Date.now(),
  };
}
