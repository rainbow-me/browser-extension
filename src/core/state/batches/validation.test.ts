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

  it('returns false for invalid id', () => {
    expect(
      validateBatchKeyParams({
        id: 'not-hex',
        sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        app: 'example.com',
      }),
    ).toBe(false);
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
    status: BatchStatus.Pending,
    atomic: true,
    txHashes: ['0xabc', '0xdef'] as `0x${string}`[],
  };

  it('returns normalized record for valid input', () => {
    const result = validateAndNormalizeBatchRecord(validRecord);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      id: '0x1234',
      sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      app: 'example.com',
      chainId: 1,
      status: BatchStatus.Pending,
      atomic: true,
      txHashes: ['0xabc', '0xdef'],
    });
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

  it('returns null for invalid txHashes', () => {
    expect(
      validateAndNormalizeBatchRecord({
        ...validRecord,
        txHashes: ['not-hex'],
      }),
    ).toBeNull();
    expect(
      validateAndNormalizeBatchRecord({
        ...validRecord,
        txHashes: 'not-array',
      }),
    ).toBeNull();
  });

  it('returns null for invalid status', () => {
    expect(
      validateAndNormalizeBatchRecord({
        ...validRecord,
        status: 999,
      }),
    ).toBeNull();
  });
});
