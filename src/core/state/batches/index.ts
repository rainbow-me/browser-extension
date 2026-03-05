import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { createExtensionStoreOptions } from '../_internal';

/** EIP-5792 batch status codes */
export const BatchStatus = {
  Pending: 100,
  Confirmed: 200,
  OffchainFailure: 400,
  CompleteRevert: 500,
  PartialRevert: 600,
} as const;

export type BatchStatusValue = (typeof BatchStatus)[keyof typeof BatchStatus];

export interface BatchRecord {
  id: `0x${string}`;
  sender: Address;
  app: string;
  chainId: number;
  status: BatchStatusValue;
  atomic: boolean;
  txHashes: `0x${string}`[];
}

export const serializeBatchKey = ({
  id,
  sender,
  app,
}: {
  id: `0x${string}`;
  sender: Address;
  app: string;
}) => `${id}:${sender.toLowerCase()}:${app}`;

export interface BatchesStore {
  batches: Record<string, BatchRecord>;
  getBatchByKey: (key: {
    id: `0x${string}`;
    sender: Address;
    app: string;
  }) => BatchRecord | undefined;
  setBatch: (record: BatchRecord) => void;
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
  }),
  createExtensionStoreOptions({
    storageKey: 'batches',
    version: 0,
  }),
);
