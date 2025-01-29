import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientOptions,
  PersistedClient,
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
  // Add throttling to prevent too frequent updates
  throttleTime: 2000,
  serialize: (data) => JSON.stringify(data),
  deserialize: (data: string) => JSON.parse(data) as PersistedClient,
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      Boolean(
        // We want to persist queries that have a `cacheTime` of above zero.
        query.gcTime !== 0,
      ),
  },
  // Add buster to clear old data
  buster: '1',
  maxAge: 1000 * 60 * 60 * 1, // 1 hour
};
