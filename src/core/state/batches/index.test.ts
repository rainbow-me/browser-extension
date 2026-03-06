import { describe, expect, it } from 'vitest';

import { BatchStatus, serializeBatchKey, useBatchStore } from './index';

describe('batches store', () => {
  it('serializes batch key correctly', () => {
    const key = serializeBatchKey({
      id: '0x123' as `0x${string}`,
      sender: '0xabc' as `0x${string}`,
      app: 'example.com',
    });
    expect(key).toBe('0x123:0xabc:example.com');
  });

  it('stores and retrieves batch by key', () => {
    const { setBatch, getBatchByKey } = useBatchStore.getState();
    const record = {
      id: '0x123' as `0x${string}`,
      sender: '0xabc' as `0x${string}`,
      app: 'example.com',
      chainId: 1,
      status: BatchStatus.Pending,
      atomic: true,
      txHashes: [] as `0x${string}`[],
    };
    setBatch(record);
    const retrieved = getBatchByKey({
      id: '0x123' as `0x${string}`,
      sender: '0xabc' as `0x${string}`,
      app: 'example.com',
    });
    expect(retrieved).toEqual(record);
  });

  it('returns undefined for unknown key', () => {
    const { getBatchByKey } = useBatchStore.getState();
    const retrieved = getBatchByKey({
      id: '0xnonexistent' as `0x${string}`,
      sender: '0xabc' as `0x${string}`,
      app: 'example.com',
    });
    expect(retrieved).toBeUndefined();
  });
});
