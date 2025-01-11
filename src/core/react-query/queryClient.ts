import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { LocalStorage } from '../storage';

const IS_DEV = process.env.IS_DEV === 'true';

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

const loggingPersisterStorage = {
  getItem: async (key: string) => {
    console.log(`[react-query persister] get: ${key}`);
    return LocalStorage.get(key);
  },
  setItem: async (key: string, value: string) => {
    console.log(`[react-query persister] set: ${key}`);
    return LocalStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    console.log(`[react-query persister] remove: ${key}`);
    return LocalStorage.remove(key);
  },
};

const asyncStoragePersister = createAsyncStoragePersister({
  key: 'rainbow.react-query',
  storage: IS_DEV
    ? loggingPersisterStorage
    : {
        getItem: LocalStorage.get,
        setItem: LocalStorage.set,
        removeItem: LocalStorage.remove,
      },
  throttleTime: 10000,
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
};
