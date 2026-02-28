import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientOptions,
  persistQueryClientSave,
} from '@tanstack/react-query-persist-client';

import { LocalStorage } from '../storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      retry: 0,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  key: 'rainbow.react-query',
  storage: {
    getItem: LocalStorage.get,
    setItem: LocalStorage.set,
    removeItem: LocalStorage.remove,
  },
});

/** Query keys excluded from persistence to keep storage under size limits. */
const PERSIST_EXCLUDED_KEYS = [
  'TokenDiscovery',
  'TokenSearch',
  'addysSummary',
  'assetMetadata',
  'assetSearchMetadata',
  'customLegacySpeed',
  'customSpeedByBaseFee',
  'customSpeedByPriorityFee',
  'estimateSwapGasLimit',
  'favorites assets',
  'galleryNfts',
  'getSwapQuote',
  'nftCollections',
  'nftsForCollection',
  'optimismL1SecurityFee',
  'price chart',
  'swapSlippage',
  'tokenInfo',
  'useNft',
  'unknown',
];

/**
 * Extracts a string identifier from a React Query key for persistence filtering.
 * Handles createQueryKey format [args, key, config], legacy [key, ...args], and object keys.
 */
export function getQueryKeyName(queryKey: readonly unknown[]): string {
  if (!Array.isArray(queryKey) || queryKey.length === 0) return '';
  const at0 = queryKey[0];
  const at1 = queryKey[1];
  // createQueryKey format: [args, key, config] — key at index 1
  if (
    typeof at1 === 'string' &&
    at1 !== 'unknown' &&
    !/^[\d]+:0x|^0x[a-fA-F0-9]+$/.test(at1)
  )
    return at1;
  // Legacy format: [key, ...args] — key at index 0
  if (typeof at0 === 'string') return at0;
  // Fallback: object at index 0 — extract key from common properties
  if (typeof at0 === 'object' && at0 !== null) {
    const obj = at0 as Record<string, unknown>;
    if (typeof obj.entity === 'string') return obj.entity;
    if (typeof obj.type === 'string') return obj.type;
  }
  // Unidentifiable key (e.g. [null], [number], empty object) — use placeholder
  return 'unknown';
}

function isOrpcQueryKey(queryKey: readonly unknown[]) {
  const keys = queryKey[0];
  return (
    Array.isArray(keys) && typeof keys[0] === 'string' && keys[0] === 'orpc'
  );
}

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  buster: '2',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      const keyName = getQueryKeyName(query.queryKey);
      if (PERSIST_EXCLUDED_KEYS.includes(keyName)) return false;
      return Boolean(
        // We want to persist queries that have a `cacheTime` of above zero.
        query.gcTime !== 0 &&
          // dont persist orpc queries
          !isOrpcQueryKey(query.queryKey),
      );
    },
  },
};

/**
 * Persists the current query cache using the configured persistence options.
 * Call this after `setQueryData` to schedule a save without waiting for the
 * next cache subscription event.
 * This still uses the persister's throttle window (default 1s).
 */
export const persistQueryCache = async () => {
  await persistQueryClientSave({
    queryClient,
    persister: persistOptions.persister,
    buster: persistOptions.buster,
    dehydrateOptions: persistOptions.dehydrateOptions,
  });
};
