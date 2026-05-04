import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientOptions,
  persistQueryClientSave,
} from '@tanstack/react-query-persist-client';

import { queryClientPersister } from './queryClientStorage';

/** Bump to invalidate persisted cache on schema/format changes */
const PERSIST_BUSTER = '3';

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

function isOrpcQueryKey(queryKey: readonly unknown[]) {
  const keys = queryKey[0];
  return (
    Array.isArray(keys) && typeof keys[0] === 'string' && keys[0] === 'orpc'
  );
}

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryClientPersister,
  buster: PERSIST_BUSTER,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      return Boolean(
        query.gcTime !== 0 &&
          !isOrpcQueryKey(query.queryKey) &&
          query.queryKey[1] !== 'TokenSearch' &&
          query.queryKey[0] !== 'TokenSearchAllNetworks',
      );
    },
  },
};

/**
 * Persists the current query cache using the configured persistence options.
 * Call this after `setQueryData` to schedule a save without waiting for the
 * next cache subscription event.
 */
export const persistQueryCache = async () => {
  await persistQueryClientSave({
    queryClient,
    persister: persistOptions.persister,
    buster: persistOptions.buster,
    dehydrateOptions: persistOptions.dehydrateOptions,
  });
};
