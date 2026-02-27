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

function isOrpcQueryKey(queryKey: readonly unknown[]) {
  const keys = queryKey[0];
  return (
    Array.isArray(keys) && typeof keys[0] === 'string' && keys[0] === 'orpc'
  );
}

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  buster: '1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
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
