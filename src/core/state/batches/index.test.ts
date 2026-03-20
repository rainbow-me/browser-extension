import type { Address } from 'viem';
import { describe, expect, it } from 'vitest';

import { BatchStatus, serializeBatchKey, useBatchStore } from './index';

describe('batches store', () => {
  it('serializes batch key correctly', () => {
    const key = serializeBatchKey({
      id: '0x123',
      sender: '0xabc' as Address,
      app: 'example.com',
    });
    expect(key).toBe('0x123:0xabc:example.com');
  });

  it('stores and retrieves batch by key', () => {
    const { setBatch, getBatchByKey } = useBatchStore.getState();
    const record = {
      id: '0x123',
      sender: '0xabc' as Address,
      app: 'example.com',
      chainId: 1,
      status: BatchStatus.Pending,
      atomic: true,
      nonces: [] as number[],
      createdAt: Date.now(),
    };
    setBatch(record);
    const retrieved = getBatchByKey({
      id: '0x123',
      sender: '0xabc' as Address,
      app: 'example.com',
    });
    expect(retrieved).toEqual(record);
  });

  it('returns undefined for unknown key', () => {
    const { getBatchByKey } = useBatchStore.getState();
    const retrieved = getBatchByKey({
      id: '0xnonexistent',
      sender: '0xabc' as Address,
      app: 'example.com',
    });
    expect(retrieved).toBeUndefined();
  });

  it('evicts batches older than 24 hours', () => {
    const { setBatch, getBatchByKey, evictExpiredBatches } =
      useBatchStore.getState();

    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    const expired = {
      id: 'expired',
      sender: '0xabc' as Address,
      app: 'example.com',
      chainId: 1,
      status: BatchStatus.Confirmed,
      atomic: true,
      nonces: [0],
      createdAt: twentyFiveHoursAgo,
    };

    const fresh = {
      id: 'fresh',
      sender: '0xabc' as Address,
      app: 'example.com',
      chainId: 1,
      status: BatchStatus.Pending,
      atomic: true,
      nonces: [] as number[],
      createdAt: Date.now(),
    };

    setBatch(expired);
    setBatch(fresh);

    evictExpiredBatches();

    expect(
      getBatchByKey({
        id: 'expired',
        sender: '0xabc' as Address,
        app: 'example.com',
      }),
    ).toBeUndefined();
    expect(
      getBatchByKey({
        id: 'fresh',
        sender: '0xabc' as Address,
        app: 'example.com',
      }),
    ).toEqual(fresh);
  });
});
