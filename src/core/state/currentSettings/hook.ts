/**
 * This file tries to implement the most performant way of fetching stores in a react context,
 * performance improvements are more important than clean code in this file.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWRSubscription from 'swr/subscription';

import type { AnyObject, ExtensionStorageWithDefaults } from './define';

/**
 * Returns a simple, type-safe wrapper for localStorage or sessionStorage.
 * Provides getItem and setItem methods for the given storage type.
 */
function getSyncStorage<T extends AnyObject>(
  type: 'localStorage' | 'sessionStorage',
) {
  const storage: Storage =
    type === 'localStorage' ? window.localStorage : window.sessionStorage;

  return {
    getItem: <K extends Extract<keyof T, string>>(key: K): T[K] | null => {
      const item = storage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item) as T[K];
      } catch {
        return null;
      }
    },
    setItem: <K extends Extract<keyof T, string>>(key: K, value: T[K]) => {
      storage.setItem(key, JSON.stringify(value));
    },
  };
}

// In-memory cache for values, scoped by store and key
const valueCacheMap = new WeakMap<object, Map<string, unknown>>();
// Track how many hook instances are listening to each key, per store
const subscriptionCountMap = new WeakMap<object, Map<string, number>>();

type UseStorageValueOptions<S, K extends keyof S, UD extends boolean> = {
  onChange?: (newValue: S[K], oldValue: S[K] | null) => void | Promise<void>;
  syncMirror?: 'localStorage';
  useDefault?: UD;
};

type SetFn<V, D> = (oldValue: V | null, defaults: D) => Exclude<V, undefined>;

type UseStorageValueResult<S, T, D> = [
  value: T,
  setValue: (value: S | SetFn<S, D>) => Promise<void>,
  {
    isLoading: boolean;
    error: Error | undefined;
  },
];

/**
 * React hook for reading and writing a value from an ExtensionStorage,
 * with in-memory caching, subscription deduplication, and optional localStorage mirroring.
 *
 * If useDefault is true (default) and a default value is provided, value is guaranteed to be defined.
 */
export function useStorageValue<
  S extends AnyObject,
  D extends Partial<S>,
  K extends Extract<keyof S, string>,
  UD extends boolean = true,
>(
  store: ExtensionStorageWithDefaults<S, D>,
  key: K,
  options: UseStorageValueOptions<S, K, UD> = {},
): UseStorageValueResult<
  S[K],
  UD extends false
    ? S[K] | undefined
    : (D extends Record<K, S[K]> ? D[K] : undefined) extends undefined
    ? S[K] | undefined
    : S[K],
  (D extends Record<K, S[K]> ? D[K] : undefined) extends undefined
    ? S[K] | undefined
    : S[K]
> {
  const { onChange, syncMirror = 'localStorage', useDefault = true } = options;
  const cacheKey = String(key);

  type TDefaults = (
    D extends Record<K, S[K]> ? D[K] : undefined
  ) extends undefined
    ? S[K] | undefined
    : S[K];

  // Get or create the value cache for this store
  const valueCache = useMemo(() => {
    let map = valueCacheMap.get(store);
    if (!map) {
      map = new Map<string, unknown>();
      valueCacheMap.set(store, map);
    }
    return map;
  }, [store]);

  // Get or create the subscription count map for this store
  const subCount = useMemo(() => {
    let map = subscriptionCountMap.get(store);
    if (!map) {
      map = new Map<string, number>();
      subscriptionCountMap.set(store, map);
    }
    return map;
  }, [store]);

  // Track loading state: if we have a cached value, we're not loading
  const [isLoading, setIsLoading] = useState(() => !valueCache.has(cacheKey));

  // Track if this hook instance is mounted
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Mirror to localStorage if desired
  const mirrorStore = useMemo(
    () => getSyncStorage<S>(syncMirror),
    [syncMirror],
  );
  const syncDefault = mirrorStore.getItem(key);

  // SWR subscription for value and error, with deduped listener logic
  const { data, error } = useSWRSubscription<
    S[K] | null,
    Error,
    ['useStorage', K]
  >(['useStorage', key], ([, subKey], { next }) => {
    let unsubscribe: (() => void) | undefined;

    // Increment subscription count for this key
    const prevCount = subCount.get(cacheKey) ?? 0;
    subCount.set(cacheKey, prevCount + 1);

    // If cached, use immediately
    if (valueCache.has(cacheKey)) {
      next(null, valueCache.get(cacheKey) as S[K]);
      setIsLoading(false);
    } else {
      // Otherwise, fetch and cache
      store.getItem(subKey).then((initialValue) => {
        valueCache.set(cacheKey, initialValue);
        next(null, initialValue);
        if (initialValue !== null && initialValue !== undefined) {
          mirrorStore.setItem(subKey, initialValue);
        }
        if (mounted.current) setIsLoading(false);
      });
    }

    // Only one onChange listener per store/key
    if (prevCount === 0) {
      unsubscribe = store.onChange(subKey, (newValue, oldValue) => {
        valueCache.set(cacheKey, newValue);
        mirrorStore.setItem(subKey, newValue);
        onChange?.(newValue, oldValue);
        next(null, newValue);
      });
    }

    // Cleanup: remove listener if last subscriber
    return () => {
      const count = subCount.get(cacheKey) ?? 1;
      if (count <= 1) {
        unsubscribe?.();
        subCount.delete(cacheKey);
      } else {
        subCount.set(cacheKey, count - 1);
      }
    };
  });

  // Write value, updating cache optimistically
  const setValue = useCallback(
    async (valueSetter: Exclude<S[K], undefined> | SetFn<S[K], TDefaults>) => {
      const value =
        typeof valueSetter === 'function'
          ? (valueSetter as SetFn<S[K], D[K] | undefined>)(
              await store.getItem(key),
              store.getDefault(key),
            )
          : valueSetter;
      valueCache.set(cacheKey, value); // frontrun changelistener
      await store.setItem(key, value);
    },
    [key, store, valueCache, cacheKey],
  );

  // Prefer cache, then SWR data, then syncDefault, then default
  const defaultValue = useDefault ? store.getDefault(cacheKey) : undefined;
  const rawValue =
    (valueCache.has(cacheKey) ? (valueCache.get(cacheKey) as S[K]) : data) ??
    syncDefault ??
    defaultValue ??
    undefined;

  // If useDefault is true and a default is provided, value is always defined
  type ResultType = UD extends false
    ? S[K] | undefined
    : (D extends Record<K, S[K]> ? D[K] : undefined) extends undefined
    ? S[K] | undefined
    : S[K];

  // Type assertion is safe: if useDefault is true, defaultValue is always present if defined in defaults
  const value = (
    useDefault ? rawValue ?? defaultValue : rawValue
  ) as ResultType;

  const additionalValues = useMemo(
    () => ({ error, isLoading }),
    [error, isLoading],
  );

  return [value, setValue, additionalValues];
}
