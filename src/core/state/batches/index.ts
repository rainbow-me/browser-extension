import {
  type BatchRecordBase,
  type FinalBatchRecord,
  type PendingBatchRecord,
} from '@rainbow-me/provider';
import { createBaseStore } from '@storesjs/stores';
import type { WalletCallReceipt } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

/** EIP-5792 batch status codes */
export const BatchStatus = {
  Pending: 100,
  Confirmed: 200,
  OffchainFailure: 400,
  CompleteRevert: 500,
  PartialRevert: 600,
} as const;

export type BatchStatusValue =
  | PendingBatchRecord['status']
  | FinalBatchRecord['status'];

/** EIP-5792 requires wallets to evict batch records after 24 hours */
const BATCH_TTL_MS = 24 * 60 * 60 * 1000;

export type BatchRecord = BatchRecordBase & {
  status: BatchStatusValue;
  /** Nonces used by the batch txs; stable across speedup/cancel */
  nonces: number[];
  /** EIP-5792 receipts; populated once the batch reaches a terminal status */
  receipts?: WalletCallReceipt[];
  /** Epoch ms when the batch was created; used for TTL eviction */
  createdAt: number;
};

type BatchKey = Pick<BatchRecord, 'id' | 'sender' | 'app'>;

export const serializeBatchKey = ({ id, sender, app }: BatchKey) =>
  `${id}:${sender.toLowerCase()}:${app}`;

export interface BatchesStore {
  batches: Record<string, BatchRecord>;
  getBatchByKey: (key: BatchKey) => BatchRecord | undefined;
  setBatch: (record: BatchRecord) => void;
  evictExpiredBatches: () => void;
}

export const useBatchStore = createBaseStore<BatchesStore>(
  (set, get) => ({
    batches: {},
    getBatchByKey: ({ id, sender, app }) => {
      const key = serializeBatchKey({ id, sender, app });
      return get().batches[key];
    },
    setBatch: (record) => {
      const key = serializeBatchKey({
        id: record.id,
        sender: record.sender,
        app: record.app,
      });
      set((state) => ({
        batches: { ...state.batches, [key]: record },
      }));
    },
    evictExpiredBatches: () => {
      const now = Date.now();
      set((state) => {
        const batches = Object.fromEntries(
          Object.entries(state.batches).filter(
            ([, batch]) => now - batch.createdAt < BATCH_TTL_MS,
          ),
        );
        return { batches };
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'batches',
    version: 0,
  }),
);
