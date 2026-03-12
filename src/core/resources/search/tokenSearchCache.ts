import { ChainId } from '~/core/types/chains';
import { SearchAsset, TokenSearchListId } from '~/core/types/search';

/**
 * Uses raw IndexedDB (not idb-keyval) – this service will need advanced querying
 * (e.g. range scans, indexes, compound keys) in the future.
 */
const IDB_DB_NAME = 'rainbow-token-search';
const IDB_STORE_NAME = 'cache';
const DB_VERSION = 1;
const INDEX_BY_TIMESTAMP = 'by-timestamp';

let cachedDb: IDBDatabase | null = null;

/** Bump to invalidate all cached TokenSearch data */
const CACHE_VERSION = 1;

/** Entries expire after 12 hours */
const TTL_MS = 12 * 60 * 60 * 1000;

type CachedEntry = { data: SearchAsset[]; timestamp: number };

function isExpired(entry: unknown): boolean {
  if (!entry || typeof entry !== 'object') return true;
  if (Array.isArray(entry)) return true; // legacy format, no timestamp
  const e = entry as CachedEntry;
  if (typeof e.timestamp !== 'number' || !Array.isArray(e.data)) return true;
  return Date.now() - e.timestamp > TTL_MS;
}

function parseEntry(entry: unknown): SearchAsset[] | null {
  if (isExpired(entry)) return null;
  return (entry as CachedEntry).data;
}

function getDb(): Promise<IDBDatabase> {
  if (cachedDb) return Promise.resolve(cachedDb);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      cachedDb = db;
      db.onclose = () => {
        cachedDb = null;
      };
      db.onversionchange = () => {
        db.close();
        cachedDb = null;
      };
      resolve(db);
    };
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(IDB_STORE_NAME);
      store.createIndex(INDEX_BY_TIMESTAMP, 'timestamp', { unique: false });
    };
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  return getDb().then((db) => {
    const tx = db.transaction(IDB_STORE_NAME, mode);
    const store = tx.objectStore(IDB_STORE_NAME);
    return fn(store);
  });
}

export type TokenSearchCacheKey = {
  chainId: ChainId;
  fromChainId?: ChainId | '';
  list: TokenSearchListId;
  query: string;
};

export function toCacheKeyString({
  chainId,
  fromChainId,
  list,
  query,
}: TokenSearchCacheKey): string {
  return `${CACHE_VERSION}:${chainId}:${fromChainId ?? ''}:${list}:${query}`;
}

/** Fetches a single key – only that record is read from IndexedDB, never the full store. */
export async function getTokenSearchFromCache(
  key: TokenSearchCacheKey,
): Promise<SearchAsset[] | null> {
  const k = toCacheKeyString(key);
  return withStore('readonly', (store) => {
    return new Promise<SearchAsset[] | null>((resolve, reject) => {
      const req = store.get(k);
      req.onsuccess = () => resolve(parseEntry(req.result));
      req.onerror = () => reject(req.error);
    });
  });
}

/** Batch fetch – one transaction, fetches only the requested keys, never the full store. */
export async function getManyTokenSearchFromCache(
  keys: TokenSearchCacheKey[],
): Promise<Map<string, SearchAsset[]>> {
  if (keys.length === 0) return new Map();
  const keyStrings = keys.map(toCacheKeyString);
  const uniqueKeys = [...new Set(keyStrings)];

  return withStore('readonly', (store) => {
    return new Promise<Map<string, SearchAsset[]>>((resolve, reject) => {
      const result = new Map<string, SearchAsset[]>();
      let pending = uniqueKeys.length;
      if (pending === 0) {
        resolve(result);
        return;
      }
      const onDone = () => {
        pending -= 1;
        if (pending === 0) resolve(result);
      };
      uniqueKeys.forEach((k) => {
        const req = store.get(k);
        req.onsuccess = () => {
          const parsed = parseEntry(req.result);
          if (parsed != null) result.set(k, parsed);
          onDone();
        };
        req.onerror = () => reject(req.error);
      });
    });
  });
}

export async function setTokenSearchInCache(
  key: TokenSearchCacheKey,
  data: SearchAsset[],
): Promise<void> {
  const k = toCacheKeyString(key);
  const entry: CachedEntry = { data, timestamp: Date.now() };
  return withStore('readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.put(entry, k);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

/** Lists all cache keys without loading values – for inspection, never loads full store. */
export async function getAllTokenSearchCacheKeys(): Promise<string[]> {
  return withStore('readonly', (store) => {
    return new Promise<string[]>((resolve, reject) => {
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function clearTokenSearchCache(): Promise<void> {
  return withStore('readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

/** Removes expired entries to reclaim storage. Safe to call periodically. */
export async function evictExpiredEntries(): Promise<number> {
  const cutoff = Date.now() - TTL_MS;
  let evicted = 0;
  return withStore('readwrite', (store) => {
    return new Promise<number>((resolve, reject) => {
      const index = store.index(INDEX_BY_TIMESTAMP);
      const req = index.openCursor(IDBKeyRange.upperBound(cutoff, true));
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) {
          resolve(evicted);
          return;
        }
        cursor.delete();
        evicted += 1;
        cursor.continue();
      };
      req.onerror = () => reject(req.error);
    });
  });
}
