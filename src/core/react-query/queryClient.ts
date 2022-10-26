import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { Storage } from '../storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1_000 * 60 * 60 * 24, // 24 hours
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
    getItem: Storage.get,
    setItem: Storage.set,
    removeItem: Storage.remove,
  },
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: asyncStoragePersister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      Boolean(
        // We want to persist queries that have a `cacheTime` of above zero.
        query.cacheTime !== 0 &&
          // We want to persist queries that have `persisterVersion` in their query key.
          (query.queryKey[2] as { persisterVersion?: number })
            ?.persisterVersion,
      ),
  },
};
