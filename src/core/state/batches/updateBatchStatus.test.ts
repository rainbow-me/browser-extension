import { BigNumber } from '@ethersproject/bignumber';
import { type Address, type Hash } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getProvider } from '~/core/viem/clientToProvider';

import {
  getBatchKeysForNonce,
  updateBatchesForMinedTx,
} from './updateBatchStatus';

import {
  type BatchRecord,
  BatchStatus,
  serializeBatchKey,
  useBatchStore,
} from './index';

vi.mock('~/core/viem/clientToProvider', () => ({
  getProvider: vi.fn(),
}));

const SENDER = '0x1234567890abcdef1234567890abcdef12345678' as Address;
const CHAIN_ID = 1;
const NONCE = 42;

const HASH_BATCH =
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as Hash;
const HASH_CANCEL =
  '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' as Hash;
const HASH_SPEEDUP =
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as Hash;

function seedBatch(
  overrides: Partial<BatchRecord> & {
    id: string;
    nonces: number[];
  },
) {
  useBatchStore.getState().setBatch({
    sender: SENDER,
    app: 'test.app',
    chainId: CHAIN_ID,
    status: BatchStatus.Pending,
    atomic: true,
    createdAt: Date.now(),
    ...overrides,
  });
}

function getBatch(id: string) {
  return useBatchStore.getState().batches[
    serializeBatchKey({ id, sender: SENDER, app: 'test.app' })
  ];
}

function fakeReceipt(hash: string, status: number) {
  return {
    status,
    transactionHash: hash,
    blockHash: '0xblockhash',
    blockNumber: 123,
    logs: [],
    gasUsed: BigNumber.from(21000),
    to: SENDER,
    from: SENDER,
    contractAddress: '',
    transactionIndex: 0,
    logsBloom: '',
    confirmations: 1,
    cumulativeGasUsed: BigNumber.from(21000),
    effectiveGasPrice: BigNumber.from(1),
    byzantium: true,
    root: undefined,
    type: 2,
  };
}

function mockProvider(receiptMap: Record<string, number | null>) {
  vi.mocked(getProvider).mockReturnValue({
    getTransactionReceipt: vi.fn((hash: string) => {
      const status = receiptMap[hash];
      if (status === null || status === undefined) return Promise.resolve(null);
      return Promise.resolve(fakeReceipt(hash, status));
    }),
  } as unknown as ReturnType<typeof getProvider>);
}

beforeEach(() => {
  useBatchStore.setState({ batches: {} });
  vi.clearAllMocks();
});

describe('getBatchKeysForNonce', () => {
  it('finds batches by nonce + chain + sender', () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    seedBatch({ id: '0x02', nonces: [99] });
    expect(getBatchKeysForNonce(NONCE, CHAIN_ID, SENDER)).toHaveLength(1);
    expect(getBatchKeysForNonce(99, CHAIN_ID, SENDER)).toHaveLength(1);
  });

  it('returns empty when no batch matches', () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    expect(getBatchKeysForNonce(999, CHAIN_ID, SENDER)).toHaveLength(0);
  });

  it('filters by chainId', () => {
    seedBatch({ id: '0x01', nonces: [NONCE], chainId: 1 });
    expect(getBatchKeysForNonce(NONCE, 137, SENDER)).toHaveLength(0);
    expect(getBatchKeysForNonce(NONCE, 1, SENDER)).toHaveLength(1);
  });

  it('filters by sender', () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    const otherSender = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as Address;
    expect(getBatchKeysForNonce(NONCE, CHAIN_ID, otherSender)).toHaveLength(0);
    expect(getBatchKeysForNonce(NONCE, CHAIN_ID, SENDER)).toHaveLength(1);
  });

  it('matches when nonces array contains the target nonce', () => {
    seedBatch({ id: '0x01', nonces: [10, NONCE, 99] });
    expect(getBatchKeysForNonce(NONCE, CHAIN_ID, SENDER)).toHaveLength(1);
  });
});

describe('updateBatchesForMinedTx', () => {
  it('marks batch as Confirmed when batch tx confirms', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_BATCH]: 1 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_BATCH,
      isCancellation: false,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.Confirmed);
  });

  it('stores the receipt when confirming', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_BATCH]: 1 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_BATCH,
      isCancellation: false,
    });
    const batch = getBatch('0x01');
    expect(batch.receipts).toHaveLength(1);
    expect(batch.receipts?.[0].transactionHash).toBe(HASH_BATCH);
    expect(batch.receipts?.[0].status).toBe('0x1');
  });

  it('marks batch as CompleteRevert when batch tx reverts', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_BATCH]: 0 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_BATCH,
      isCancellation: false,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.CompleteRevert);
  });

  it('marks batch as CompleteRevert when cancel tx confirms', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_CANCEL]: 1 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_CANCEL,
      isCancellation: true,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.CompleteRevert);
  });

  it('marks batch as Confirmed when cancel loses (no receipt → original won)', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_CANCEL]: null });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_CANCEL,
      isCancellation: true,
    });
    const batch = getBatch('0x01');
    expect(batch.status).toBe(BatchStatus.Confirmed);
    expect(batch.receipts).toBeUndefined();
  });

  it('marks Confirmed when speedup loses race (no receipt for speedup hash)', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_SPEEDUP]: null });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_SPEEDUP,
      isCancellation: false,
    });
    const batch = getBatch('0x01');
    expect(batch.status).toBe(BatchStatus.Confirmed);
    expect(batch.receipts).toBeUndefined();
  });

  it('marks batch as Confirmed when speedup tx confirms', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_SPEEDUP]: 1 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_SPEEDUP,
      isCancellation: false,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.Confirmed);
  });

  it('marks batch as CompleteRevert when speedup tx reverts', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_SPEEDUP]: 0 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_SPEEDUP,
      isCancellation: false,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.CompleteRevert);
  });

  it('marks batch as CompleteRevert when cancel tx itself reverts', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    mockProvider({ [HASH_CANCEL]: 0 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_CANCEL,
      isCancellation: true,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.CompleteRevert);
  });

  it('returns count of updated batches', async () => {
    seedBatch({ id: '0x01', nonces: [NONCE] });
    seedBatch({ id: '0x02', nonces: [NONCE] });
    mockProvider({ [HASH_BATCH]: 1 });

    const count = await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_BATCH,
      isCancellation: false,
    });
    expect(count).toBe(2);
  });

  it('returns 0 when no batch matches', async () => {
    seedBatch({ id: '0x01', nonces: [999] });
    mockProvider({ [HASH_BATCH]: 1 });

    const count = await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_BATCH,
      isCancellation: false,
    });
    expect(count).toBe(0);
  });

  it('does not modify batch when batch key is not found', async () => {
    seedBatch({ id: '0x01', nonces: [999] });
    mockProvider({ [HASH_BATCH]: 1 });

    await updateBatchesForMinedTx({
      nonce: NONCE,
      chainId: CHAIN_ID,
      sender: SENDER,
      hash: HASH_BATCH,
      isCancellation: false,
    });
    expect(getBatch('0x01').status).toBe(BatchStatus.Pending);
  });
});
