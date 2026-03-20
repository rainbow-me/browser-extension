import { describe, expect, it } from 'vitest';

import {
  validateAndNormalizeBatchRecord,
  validateBatchKeyParams,
} from './validation';

import { BatchStatus } from './index';

describe('validateBatchKeyParams', () => {
  it('returns true for valid params', () => {
    expect(
      validateBatchKeyParams({
        id: '0x1234',
        sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        app: 'example.com',
      }),
    ).toBe(true);
  });

  it('returns false for non-object', () => {
    expect(validateBatchKeyParams(null)).toBe(false);
    expect(validateBatchKeyParams(undefined)).toBe(false);
    expect(validateBatchKeyParams('string')).toBe(false);
  });

  it('accepts any string id (EIP-5792 opaque identifier)', () => {
    expect(
      validateBatchKeyParams({
        id: 'not-hex',
        sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        app: 'example.com',
      }),
    ).toBe(true);
  });

  it('returns false for non-string id', () => {
    expect(
      validateBatchKeyParams({
        id: 123,
        sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        app: 'example.com',
      }),
    ).toBe(false);
  });

  it('returns false for invalid sender', () => {
    expect(
      validateBatchKeyParams({
        id: '0x1234',
        sender: 'not-an-address',
        app: 'example.com',
      }),
    ).toBe(false);
  });

  it('returns false for invalid app', () => {
    expect(
      validateBatchKeyParams({
        id: '0x1234',
        sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        app: 123,
      }),
    ).toBe(false);
  });
});

describe('validateAndNormalizeBatchRecord', () => {
  const validRecord = {
    id: '0x1234',
    sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    app: 'example.com',
    chainId: 1,
    atomic: true,
  };

  it('returns normalized record with status Pending, nonces: [], and createdAt', () => {
    const result = validateAndNormalizeBatchRecord(validRecord);
    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      ...validRecord,
      status: BatchStatus.Pending,
      nonces: [],
    });
    expect(result?.createdAt).toBeGreaterThan(0);
  });

  it('accepts non-hex id (EIP-5792 opaque identifier)', () => {
    const result = validateAndNormalizeBatchRecord({
      ...validRecord,
      id: 'my-custom-batch-id',
    });
    expect(result).not.toBeNull();
    expect(result?.id).toBe('my-custom-batch-id');
  });

  it('normalizes chainId from string', () => {
    const result = validateAndNormalizeBatchRecord({
      ...validRecord,
      chainId: '137',
    });
    expect(result).not.toBeNull();
    expect(result?.chainId).toBe(137);
  });

  it('returns null for non-object', () => {
    expect(validateAndNormalizeBatchRecord(null)).toBeNull();
    expect(validateAndNormalizeBatchRecord(undefined)).toBeNull();
  });

  it('returns null for missing required fields', () => {
    const { id: _, ...noId } = validRecord;
    expect(validateAndNormalizeBatchRecord(noId)).toBeNull();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { atomic: _a, ...noAtomic } = validRecord;
    expect(validateAndNormalizeBatchRecord(noAtomic)).toBeNull();
  });
});
